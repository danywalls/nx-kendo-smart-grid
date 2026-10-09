import { useContext, useRef, useState, createContext } from 'react';
import {
  COSTUME_CATALOG,
  createCostumeInsight,
  searchCostumes,
  type Costume,
} from 'costume-domain';
import { Button, type ButtonHandle } from '@progress/kendo-react-buttons';
import {
  InlineAIPrompt,
  type InlineAIPromptOutputInterface,
} from '@progress/kendo-react-conversational-ui';
import {
  Grid,
  GridColumn,
  GridToolbar,
  SmartBox,
  type GridCustomCellProps,
  type GridSmartBoxSearchEvent,
} from '@progress/kendo-react-grid';

type UpdateInsight = (id: number, insight: string) => void;
const UpdateInsightContext = createContext<UpdateInsight | null>(null);

function isCostume(value: unknown): value is Costume {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Partial<Costume>;
  return (
    typeof item.id === 'number' &&
    typeof item.character === 'string' &&
    typeof item.description === 'string' &&
    Array.isArray(item.embedding)
  );
}

function AssistantCell(props: GridCustomCellProps) {
  const updateInsight = useContext(UpdateInsightContext);
  const buttonRef = useRef<ButtonHandle>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [outputs, setOutputs] = useState<InlineAIPromptOutputInterface[]>([]);

  if (!updateInsight) {
    throw new Error(
      'AssistantCell must be rendered inside UpdateInsightContext.',
    );
  }

  if (!isCostume(props.dataItem)) {
    return <td {...(props.tdProps ?? {})}>{props.children}</td>;
  }

  const costume = props.dataItem;

  const handlePromptRequest = async (prompt: string) => {
    try {
      const insight = await createCostumeInsight(costume, prompt);
      setOutputs([{ id: Date.now(), prompt, responseContent: insight }]);
      updateInsight(costume.id, insight);
    } catch (error) {
      console.error('Could not create the costume insight.', error);
      setOutputs([
        {
          id: Date.now(),
          prompt,
          responseContent:
            'The demo assistant could not create an answer. Please try again.',
        },
      ]);
    }
  };

  return (
    <td {...(props.tdProps ?? {})}>
      <Button
        ref={buttonRef}
        fillMode="flat"
        themeColor="primary"
        onClick={() => setShowPrompt(true)}
      >
        Ask AI
      </Button>
      <InlineAIPrompt
        anchor={buttonRef.current?.element}
        show={showPrompt}
        promptPlaceholder={`Ask about ${costume.character}...`}
        outputs={outputs}
        onClose={() => setShowPrompt(false)}
        onPromptRequest={(prompt) => void handlePromptRequest(prompt)}
      />
    </td>
  );
}

export function App() {
  const [catalog, setCatalog] = useState<Costume[]>(COSTUME_CATALOG);
  const [gridData, setGridData] = useState<Costume[]>(COSTUME_CATALOG);

  const handleSemanticSearch = (event: GridSmartBoxSearchEvent) => {
    const query = event.searchValue.trim();
    setGridData(query ? searchCostumes(query, catalog) : catalog);
  };

  const updateInsight: UpdateInsight = (id, insight) => {
    const update = (costumes: Costume[]) =>
      costumes.map((costume) =>
        costume.id === id ? { ...costume, aiAssistedInfo: insight } : costume,
      );

    setCatalog(update);
    setGridData(update);
  };

  return (
    <UpdateInsightContext.Provider value={updateInsight}>
      <main className="page-shell">
        <header className="page-header">
          <p className="eyebrow">Online costume store · React + KendoReact</p>
          <h1>Find a costume for Halloween</h1>
          <p className="intro">
            Search by an idea, not only by a character name. Ask for more detail
            without leaving the store.
          </p>
        </header>

        <section className="grid-panel" aria-label="Halloween costume catalog">
          <Grid data={gridData} sortable>
            <GridToolbar>
              <SmartBox
                searchConfig={false}
                semanticSearchConfig={{
                  enabled: true,
                  placeholder:
                    'Describe a costume, for example "friendly rock alien"...',
                  delay: 500,
                }}
                activeMode="semanticSearch"
                onSemanticSearch={handleSemanticSearch}
              />
            </GridToolbar>
            <GridColumn field="character" title="Character" width="180px" />
            <GridColumn field="name" title="Costume" width="220px" />
            <GridColumn
              field="aiAssistedInfo"
              title="AI costume insight"
              width="320px"
            />
            <GridColumn
              field="assistant"
              title="Assistant"
              width="120px"
              cells={{ data: AssistantCell }}
            />
          </Grid>
        </section>

        <p className="demo-note">
          This runnable demo uses local sample vectors and fixed assistant
          responses. Replace them with your embedding and AI APIs for
          production.
        </p>
      </main>
    </UpdateInsightContext.Provider>
  );
}

export default App;
