import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  createCostumeInsight,
  COSTUME_CATALOG,
  searchCostumes,
  type Costume,
} from 'costume-domain';
import { KENDO_BUTTON } from '@progress/kendo-angular-buttons';
import {
  GridSmartBoxSemanticSearchEvent,
  GridSmartBoxSemanticSearchSettings,
  KENDO_GRID,
} from '@progress/kendo-angular-grid';
import {
  InlineAIPromptService,
  KENDO_INLINEAIPROMPT,
} from '@progress/kendo-angular-conversational-ui';
import type {
  InlineAIPromptComponent,
  InlineAIPromptRequestEvent,
  PromptOutput,
} from '@progress/kendo-angular-conversational-ui';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';

@Component({
  standalone: true,
  imports: [KENDO_BUTTON, KENDO_GRID, KENDO_INLINEAIPROMPT, KENDO_TOOLBAR],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly promptService = inject(InlineAIPromptService);
  private readonly catalog = signal<Costume[]>(COSTUME_CATALOG);
  private latestSmartBoxQuery = '';

  protected readonly gridData = signal<Costume[]>(COSTUME_CATALOG);
  protected readonly semanticSearchSettings: GridSmartBoxSemanticSearchSettings =
    {
      enabled: true,
      placeholder: 'Describe a costume, for example "friendly rock alien"...',
      delay: 500,
    };

  protected onSmartBoxInput(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.latestSmartBoxQuery = target.value.trim();
      if (!this.latestSmartBoxQuery) {
        this.gridData.set(this.catalog());
      }
    }
  }

  protected onSemanticSearch(event: GridSmartBoxSemanticSearchEvent): void {
    const query = event.searchValue.trim();

    if (query !== this.latestSmartBoxQuery) {
      return;
    }

    if (!query) {
      this.gridData.set(this.catalog());
      return;
    }

    this.gridData.set(searchCostumes(query, this.catalog()));
  }

  protected onAskAI(costume: Costume, anchor: HTMLElement): void {
    const popup = this.promptService.open({
      popupSettings: { anchor },
      placeholder: `Ask about ${costume.character}...`,
    });
    const promptComponent = popup.content.instance;

    promptComponent.promptRequest.subscribe(
      (event: InlineAIPromptRequestEvent) => {
        void this.createInsight(costume, event.prompt, promptComponent);
      },
    );
  }

  private async createInsight(
    costume: Costume,
    prompt: string,
    promptComponent: InlineAIPromptComponent,
  ): Promise<void> {
    const output: PromptOutput = {
      id: crypto.randomUUID(),
      prompt,
      output: '',
    };
    promptComponent.promptOutput = output;
    promptComponent.streaming = true;

    try {
      const insight = await createCostumeInsight(costume, prompt);
      promptComponent.promptOutput = { ...output, output: insight };
      this.updateInsight(costume.id, insight);
    } catch (error) {
      console.error('Could not create the costume insight.', error);
      promptComponent.promptOutput = {
        ...output,
        output:
          'The demo assistant could not create an answer. Please try again.',
      };
    } finally {
      promptComponent.streaming = false;
    }
  }

  private updateInsight(id: number, insight: string): void {
    const update = (costumes: Costume[]) =>
      costumes.map((costume) =>
        costume.id === id ? { ...costume, aiAssistedInfo: insight } : costume,
      );

    this.catalog.update(update);
    this.gridData.update(update);
  }
}
