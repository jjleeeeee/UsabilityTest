import * as React from 'react';
import {
  Box,
  Button,
  Textarea,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  ModalClose,
  DialogActions,
  FormControl,
  FormLabel,
  Input,
  Alert,
  Link,
  Typography,
} from '@mui/joy';

import { AutoAwesome, FaceRetouchingNatural, Delete } from '@mui/icons-material';

const App = () => {
  const [taskNodes, setTaskNodes] = React.useState<{ id: string; name: string }[]>([]);
  const [taskDesc, setTaskDesc] = React.useState<string>('');
  const [personaDesc, setPersonaDesc] = React.useState<string>('');
  const [reportNode, setReportNode] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [geminiApiKey, setGeminiApiKey] = React.useState('');
  const [personaModalOpen, setPersonaModalOpen] = React.useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = React.useState(false);
  const [apiKeyInput, setApiKeyInput] = React.useState('');

  const currentApiKey = geminiApiKey;

  const handleSubmit = (e) => {
    e.preventDefault();

    const demoTimestamp = new Date();
    const taskName: string = `self_explore_${demoTimestamp.getFullYear()}-${demoTimestamp.getMonth() + 1
      }-${demoTimestamp.getDate()}_${demoTimestamp.getHours()}-${demoTimestamp.getMinutes()}-${demoTimestamp.getSeconds()}`;

    const postData = {
      nodeIds: taskNodes.map((n) => n.id),
      taskName: taskName,
      taskDesc: taskDesc,
      personaDesc: personaDesc ? personaDesc : undefined,
    };

    parent.postMessage({ pluginMessage: { type: 'submit', data: postData } }, '*');
  };

  const handleKeyDown = async (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const isEligible = taskDesc && taskNodes.length > 0 && currentApiKey;

  const handleNodeClick = (nodeId: string) => {
    parent.postMessage({ pluginMessage: { type: 'moveFocus', data: nodeId } }, '*');
  };

  const handleApiKeySubmit = () => {
    if (apiKeyInput.trim() !== '') {
      parent.postMessage({ pluginMessage: { type: 'saveApiKey', data: { provider: 'Gemini', apiKey: apiKeyInput } } }, '*');
      setApiKeyInput('');
    }
  };

  const handleApiKeyDelete = () => {
    setApiKeyInput('');
    parent.postMessage({ pluginMessage: { type: 'deleteApiKey', data: 'Gemini' } }, '*');
    setApiKeyModalOpen(false);
  };


  React.useEffect(() => {
    window.onmessage = (event) => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'nodeInfo') {
        setTaskNodes(message);
      }
      if (type === 'clear') {
        setTaskNodes([]);
        setReportNode('');
      }
      if (type === 'loading') {
        setLoading(message);
      }
      if (type === 'reportNode') {
        setReportNode(message);
      }
      if (type === 'config') {
        setGeminiApiKey(message.geminiApiKey);
        setApiKeyInput(message.geminiApiKey);
      }
    };
  }, []);


  return (
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Textarea
        placeholder={
          taskNodes.length > 0
            ? `Please enter the description of the task you want me on \"${taskNodes[0].name}\" to complete in a few sentences.\nOnce done, click 'Submit' or press 'Cmd/Ctrl + Enter'`
            : 'Select one or more frames to start testing'
        }
        disabled={taskNodes.length === 0}
        value={taskDesc}
        onChange={(event) => setTaskDesc(event.target.value)}
        onKeyDown={handleKeyDown}
        minRows={4}
        maxRows={8}
        size="md"
        startDecorator={
          <Box sx={{ display: 'flex', gap: 0.5, flex: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => taskNodes.length > 0 && handleNodeClick(taskNodes[0].id)}
              size="sm"
              disabled={taskNodes.length === 0}
            >
              {taskNodes.length > 0
                ? taskNodes.length === 1
                  ? taskNodes[0].name.length > 12
                    ? `${taskNodes[0].name.slice(0, 12)}...`
                    : taskNodes[0].name
                  : `${taskNodes.length} Frames selected`
                : '🎨 No frame'}
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => handleNodeClick(reportNode)}
              size="sm"
              disabled={!reportNode}
            >
              📝 Report
            </Button>
            <Typography level="body-xs" fontWeight="bold" sx={{ ml: 'auto', mr: 1, color: 'primary.plainColor' }}>
              Gemini Flash
            </Typography>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setApiKeyInput(currentApiKey);
                setApiKeyModalOpen(true);
              }}
              size="sm"
            >
              {currentApiKey ? '🔑 Key' : '🔒 No key'}
            </Button>
          </Box>
        }
        endDecorator={
          <Box
            sx={{
              display: 'flex',
              gap: 'var(--Textarea-paddingBlock)',
              pt: 'var(--Textarea-paddingBlock)',
              borderTop: '1px solid',
              borderColor: 'divider',
              flex: 'auto',
            }}
          >
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setPersonaModalOpen(true)}
              disabled={isEligible ? false : true}
              startDecorator={<FaceRetouchingNatural fontSize="small" />}
            >
              {personaDesc ? (personaDesc.length > 12 ? `${personaDesc.slice(0, 12)}...` : personaDesc) : 'Persona'}
            </Button>

            <Button
              loading={loading}
              disabled={isEligible ? false : true}
              loadingIndicator="Loading…"
              color="primary"
              sx={{ ml: 'auto' }}
              size="sm"
              onClick={handleSubmit}
              startDecorator={<AutoAwesome fontSize="small" />}
            >
              Submit
            </Button>
          </Box>
        }
        sx={{ minWidth: 480, minHeight: 240 }}
      />
      {taskNodes.length > 1 && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'background.level1', borderRadius: 'sm' }}>
          <Typography level="body-xs" mb={0.5} fontWeight="bold">
            Selected Flow (in order):
          </Typography>
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
            {taskNodes.map((node, index) => (
              <Box
                key={node.id}
                sx={{
                  px: 1,
                  py: 0.5,
                  bgcolor: 'background.surface',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 'xs',
                  whiteSpace: 'nowrap',
                  fontSize: 'xs',
                }}
              >
                {index + 1}. {node.name}
              </Box>
            ))}
          </Stack>
        </Box>
      )}
      <Modal open={personaModalOpen} onClose={() => setPersonaModalOpen(false)}>
        <ModalDialog layout="fullscreen">
          <ModalClose />
          <DialogTitle>Create Persona</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Textarea
                placeholder="(Optional) Please enter the description of the user persona you'd like me to emulate : "
                autoFocus
                value={personaDesc}
                minRows={3}
                maxRows={6}
                onChange={(e) => setPersonaDesc(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant="soft" onClick={() => setPersonaModalOpen(false)}>
              Set Persona
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => {
                setPersonaDesc('');
                setPersonaModalOpen(false);
              }}
            >
              Reset
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      <Modal open={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)}>
        <ModalDialog sx={{ width: 400, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
          <ModalClose />
          <Typography level="body-lg" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
            Gemini API Configuration
          </Typography>

          <Alert color="primary" variant="soft" sx={{ mb: 2 }}>
            <div>
              <Typography level="body-lg" mb={0.5}>
                Gemini API Key Required
              </Typography>
              <Typography level="body-sm">
                Get one from{' '}
                <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">
                  Google AI Studio
                </Link>
                .
              </Typography>
            </div>
          </Alert>

          <FormControl>
            <FormLabel>Enter your Gemini API Key:</FormLabel>
            <Input
              type="password"
              value={apiKeyInput}
              onChange={(event) => setApiKeyInput(event.target.value)}
              sx={{ mt: 1 }}
            />
          </FormControl>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="plain" onClick={() => setApiKeyModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApiKeySubmit} disabled={apiKeyInput.trim() === '' || apiKeyInput === currentApiKey}>
                Save
              </Button>
            </Box>
            <Button variant="plain" color="danger" onClick={handleApiKeyDelete} startDecorator={<Delete />}>
              Delete
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default App;
