import { PostData } from '../UsabilityTester.type';
import {
  createTaskFrameWithNameAndDesc,
  getGenerateReportPrompt,
  getImage,
  generateReportResult,
  sendNodeInfoToUI,
  createTextFrame,
  createBoundingBox,
  createTouchPoint,
  createSwipeArrow,
  createSpeechBubble,
} from './utils/FigmaUtils';
import { createModelInstance } from './api';
import { aiConfig, updateAIConfig } from './config';
import { createHolisticPrompt } from './utils/prompts';
import { SequenceProcessor, SequenceStepResult } from './sequenceProcessor';

// Create model instance
let modelInstance = createModelInstance(aiConfig);

figma.showUI(__html__, { width: 512, height: 450 });

// 폰트 로드 함수
async function loadFonts() {
  await figma.loadFontAsync({ family: 'Pretendard', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Pretendard', style: 'Bold' });
}

// Error message handler 함수
function errorMessageHandler(errorMessage: any) {
  const message = typeof errorMessage === 'string' ? errorMessage : String(errorMessage.message || JSON.stringify(errorMessage));
  console.error('Error:', message);
  figma.notify(message, { error: true });
}

const requestAIModelAndProcessResponse = async (prompt: string, afterImageId: string, modelInstance: any) => {
  try {
    const afterImageBase64: string = await getImage(afterImageId);
    const response = await modelInstance.getModelResponse(prompt, [afterImageBase64]);
    return response;
  } catch (error) {
    console.error('Error in requestAIModelAndProcessResponse:', error);
    figma.notify('An error occurred while processing AI model response', { timeout: 3000 });
    return { success: false, error: error.message };
  }
};

async function updateAndSendApiKey(apiKey: string) {
  try {
    const isValid = true; // Gemini validity check currently skipped
    if (isValid) {
      await figma.clientStorage.setAsync('geminiApiKey', apiKey);
      await figma.clientStorage.setAsync('currentProvider', 'Gemini');
      updateAIConfig({ provider: 'Gemini', apiKey });
      modelInstance = createModelInstance(aiConfig);
      figma.ui.postMessage({
        type: 'config',
        message: {
          geminiApiKey: apiKey,
          provider: 'Gemini',
        },
      });
      figma.notify(`Gemini API key has been updated`, { timeout: 2000 });
    } else {
      figma.ui.postMessage({ type: 'invalidApiKey' });
      figma.notify('Invalid API key. Please enter a valid API key.', { error: true, timeout: 3000 });
    }
  } catch (error) {
    console.error('Error updating API key:', error);
    figma.notify('An error occurred while updating the API key.', { error: true });
  }
}

// Send key and selection when the UI is loaded
async function sendApiKeyAndNodeInfoToUI() {
  const geminiApiKey = (await figma.clientStorage.getAsync('geminiApiKey')) || '';
  const currentProvider = 'Gemini';
  if (geminiApiKey) updateAIConfig({ apiKey: geminiApiKey, provider: 'Gemini' });
  modelInstance = createModelInstance(aiConfig);
  figma.ui.postMessage({
    type: 'config',
    message: {
      geminiApiKey: geminiApiKey,
      provider: currentProvider,
    },
  });
  await sendNodeInfoToUI();
}

figma.on('run', async () => {
  await sendApiKeyAndNodeInfoToUI();
});

figma.on('selectionchange', async () => {
  await sendNodeInfoToUI();
});

async function createHolisticReportResult(data: string, taskFrameId: string, results: SequenceStepResult[]) {
  const taskFrame = (await figma.getNodeByIdAsync(taskFrameId)) as FrameNode;

  // Journy map thumbnails removed due to quality issues.

  // Extract 'Journey Actions' section with multiple fallback patterns
  // Try various possible headers the AI might use
  let actionsSection = '';
  const sectionPatterns = [
    /(?:Journey Actions|여정 분석|행동 분석|Actions)[:：]?\s*([\s\S]*?)(?=(?:Summary|요약|종합)|$)/i,
    /(?:여정 행동|행동|동작)[:：]?\s*([\s\S]*?)(?=(?:Summary|요약|종합)|$)/i,
  ];

  for (const pattern of sectionPatterns) {
    const match = data.match(pattern);
    if (match && match[1].trim()) {
      actionsSection = match[1];
      break;
    }
  }

  const stepActions: string[] = [];
  for (let i = 1; i <= results.length; i++) {
    let foundAction = '';

    // Strategy 1: Parse from actionsSection if available
    if (actionsSection) {
      const regex = new RegExp(`(?:-?\\s*Step\\s*${i}|-?\\s*${i}\\s*단계)\\s*(?:Action|행동|동작)?[:：]?\\s*([\\s\\S]*?)(?=(?:-?\\s*Step\\s*\\d+|-?\\s*\\d+\\s*단계)|$)`, 'i');
      const match = actionsSection.match(regex);
      if (match && match[1].trim()) {
        foundAction = match[1].trim();
      }
    }

    // Strategy 2: Search entire response for function-style actions (tap, swipe, text, long_press)
    if (!foundAction) {
      const functionPatterns = [
        new RegExp(`(?:Step\\s*${i}|${i}\\s*단계|${i}번째).*?((?:tap|swipe|text|long_press)\\s*\\([^)]+\\))`, 'is'),
        new RegExp(`(?:Step\\s*${i}|${i}\\s*단계).*?[:：]\\s*((?:tap|swipe|text|long_press)\\s*\\([^)]+\\))`, 'is'),
      ];
      for (const pattern of functionPatterns) {
        const match = data.match(pattern);
        if (match) {
          foundAction = match[1].trim();
          break;
        }
      }
    }

    // Strategy 3: Look for any function near Step N mention
    if (!foundAction) {
      // Find all tap/swipe/text/long_press occurrences and try to associate with step number
      const allFunctions = [...data.matchAll(/(tap|swipe|text|long_press)\s*\([^)]+\)/gi)];
      if (allFunctions.length >= i) {
        foundAction = allFunctions[i - 1][0];
      }
    }

    stepActions.push(foundAction || 'FINISH');
  }

  // DEBUG: Log parsed actions to help troubleshoot
  console.log('[DEBUG] === AI RESPONSE (first 2000 chars) ===');
  console.log(data.substring(0, 2000));
  console.log('[DEBUG] actionsSection found:', actionsSection ? 'YES' : 'NO');
  console.log('[DEBUG] stepActions:', stepActions);
  figma.notify(`[Debug] Check console for full AI response`, { timeout: 5000 });

  // Helper: clean markdown formatting
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*[:：]?\s*/g, '')  // Remove **:
      .replace(/\*\*/g, '')           // Remove remaining **
      .replace(/^\s*-\s*/gm, '')      // Remove leading dashes
      .replace(/^\s*[:：]\s*/gm, '')  // Remove leading colons
      .trim();
  };

  // Parse step-by-step observations
  const stepObservations: string[] = [];
  const observationMatch = data.match(/(?:\*{0,2}Observation|관찰)\*{0,2}[:：]?\s*([\s\S]*?)(?=(?:\n\s*\*{0,2}(?:Thought|사고))|\*{0,2}(?:Thought|사고)\*{0,2}[:：]|$)/i);
  const observationSection = observationMatch ? observationMatch[1] : '';

  for (let i = 1; i <= results.length; i++) {
    const stepRegex = new RegExp(`(?:-?\\s*Step\\s*${i}|${i}\\s*단계)[:：]?\\s*([\\s\\S]*?)(?=(?:-?\\s*Step\\s*\\d+|\\d+\\s*단계)|$)`, 'i');
    const match = observationSection.match(stepRegex);
    stepObservations.push(match ? cleanMarkdown(match[1]) : '');
  }

  // Combined loop: for each result, add labeled_action THEN Step Analysis (correct order)
  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    const labeledFrame = (await figma.getNodeByIdAsync(res.labeledFrameId)) as FrameNode;
    const previewFrame = (await figma.getNodeByIdAsync(res.previewFrameId)) as FrameNode;

    if (previewFrame) {
      // 1. First add labeled_action frame (if applicable)
      const actionStr = stepActions[i];
      if (labeledFrame && actionStr && actionStr !== 'FINISH') {
        const { elemList, imageBytes, elementStartX, elementStartY } = res;
        const actionImageFrame = figma.createFrame();
        actionImageFrame.name = `${i + 1}_labeled_action`;
        actionImageFrame.resize(labeledFrame.width, labeledFrame.height);

        const beforeImage = figma.createRectangle();
        beforeImage.resize(labeledFrame.width, labeledFrame.height);
        const beforeImg = figma.createImage(imageBytes);
        beforeImage.fills = [{ type: 'IMAGE', imageHash: beforeImg.hash, scaleMode: 'FILL' }];
        actionImageFrame.appendChild(beforeImage);

        if (actionStr.includes('tap') || actionStr.includes('long_press')) {
          const areaMatch = actionStr.match(/\((.*?)\)/);
          const area = areaMatch ? parseInt(areaMatch[1]) : null;
          if (area && elemList[area - 1]) {
            const selectedElem = elemList[area - 1];
            actionImageFrame.appendChild(createBoundingBox(selectedElem, elementStartX, elementStartY));
            actionImageFrame.appendChild(createTouchPoint(selectedElem, elementStartX, elementStartY));
          }
        } else if (actionStr.includes('swipe')) {
          const paramsMatch = actionStr.match(/swipe\((.*?)\)/);
          const params = paramsMatch ? paramsMatch[1].split(',') : [];
          if (params.length >= 2) {
            const area = parseInt(params[0]);
            const direction = params[1].trim() as any;
            const distance = params[2] ? params[2].trim() : 'medium';
            const selectedElem = elemList[area - 1];
            if (selectedElem) {
              actionImageFrame.appendChild(createBoundingBox(selectedElem, elementStartX, elementStartY));
              actionImageFrame.appendChild(createSwipeArrow(selectedElem, direction, distance, elementStartX, elementStartY));
            }
          }
        } else if (actionStr.includes('text')) {
          const inputMatch = actionStr.match(/text\("(.*?)"\)/);
          const inputStr = inputMatch ? inputMatch[1] : '';
          const areaMatch = actionStr.match(/text\((.*?)\)/);
          const area = areaMatch ? parseInt(areaMatch[1]) : null;
          const selectedElem = area ? elemList[area - 1] : null;
          if (selectedElem) {
            actionImageFrame.appendChild(createBoundingBox(selectedElem, elementStartX, elementStartY));
            actionImageFrame.appendChild(createSpeechBubble(selectedElem, inputStr, elementStartX, elementStartY));
          }
        }
        previewFrame.appendChild(actionImageFrame);
      }

      // 2. Then add Step Analysis frame (only if not already exists)
      const existingAnalysis = previewFrame.children.find(
        child => child.name === `Step ${i + 1} Analysis`
      );
      if (!existingAnalysis) {
        const stepResultFrame = figma.createFrame();
        stepResultFrame.name = `Step ${i + 1} Analysis`;
        stepResultFrame.fills = [];
        stepResultFrame.layoutMode = 'VERTICAL';
        stepResultFrame.itemSpacing = 16;
        stepResultFrame.resize(500, 100); // Width 500px
        stepResultFrame.primaryAxisSizingMode = 'AUTO';
        stepResultFrame.counterAxisSizingMode = 'FIXED';

        const obs = stepObservations[i] || `Step ${i + 1} 관찰 내용 없음`;
        const obsFrame = createTextFrame(`관찰 (Step ${i + 1})`, obs);
        stepResultFrame.appendChild(obsFrame);
        obsFrame.layoutSizingHorizontal = 'FILL'; // Set AFTER appendChild

        const cleanedAction = cleanMarkdown(stepActions[i] || 'FINISH');
        const actionFrame = createTextFrame('행동 (Action)', cleanedAction);
        stepResultFrame.appendChild(actionFrame);
        actionFrame.layoutSizingHorizontal = 'FILL'; // Set AFTER appendChild

        previewFrame.appendChild(stepResultFrame);
      }
    }
  }

  // === Summary frame at the end (UX Insights + Summary) ===
  const resFrame = figma.createFrame();
  resFrame.name = 'Analysis Summary';
  resFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  resFrame.cornerRadius = 24;
  resFrame.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
  resFrame.strokeWeight = 2;
  resFrame.layoutMode = 'VERTICAL';
  resFrame.itemSpacing = 32;
  resFrame.paddingTop = resFrame.paddingBottom = resFrame.paddingLeft = resFrame.paddingRight = 40;
  resFrame.primaryAxisSizingMode = 'AUTO';
  resFrame.counterAxisSizingMode = 'AUTO';

  const summaryPatterns = [
    // UX Insights (Thought)
    { label: 'UX 인사이트 (UX Insights)', pattern: /(?:\*{0,2}Thought|사고)\*{0,2}[:：]?\s*([\s\S]*?)(?=(?:\n\s*\*{0,2}(?:Journey|여정|Summary|요약))|\*{0,2}(?:Journey|여정|Summary|요약)\*{0,2}[:：]|$)/i },
    // Summary
    { label: '종합 요약 (Summary)', pattern: /(?:\*{0,2}Summary|요약)\*{0,2}[:：]?\s*([\s\S]*?)$/i }
  ];

  let hasContent = false;
  summaryPatterns.forEach(section => {
    const match = data.match(section.pattern);
    if (match && match[1].trim()) {
      resFrame.appendChild(createTextFrame(section.label, match[1].trim()));
      hasContent = true;
    }
  });

  if (!hasContent) {
    resFrame.appendChild(createTextFrame('분석 결과 (Analysis Result)', data.trim()));
  }

  taskFrame.appendChild(resFrame);
  figma.viewport.scrollAndZoomIntoView([resFrame]);
}

async function generateReport(postData: PostData, modelInstance: any) {
  try {
    figma.ui.postMessage({ type: 'loading', message: true });
    await loadFonts();
    const { taskFrame } = await createTaskFrameWithNameAndDesc(postData);
    figma.ui.postMessage({ type: 'reportNode', message: taskFrame.id });

    if (postData.nodeIds.length > 1) {
      figma.notify(`Analyzing ${postData.nodeIds.length} frames...`);
      const processor = new SequenceProcessor();
      const sequenceResults: SequenceStepResult[] = await processor.processSequence(postData, taskFrame.id);
      const allLabeledImages = sequenceResults.map(res => res.afterImageBase64);
      const prompt = createHolisticPrompt(postData.taskDesc, allLabeledImages.length, postData.personaDesc);
      const response = await modelInstance.getModelResponse(prompt, allLabeledImages);

      if (response.success && response.data) {
        await createHolisticReportResult(response.data, taskFrame.id, sequenceResults);
      } else {
        errorMessageHandler(response.error || 'Failed to get holistic response');
      }
    } else {
      const nodeId = postData.nodeIds[0];
      const { prompt, previewFrameId, beforeImageId, afterImageId, elemList, elementStartX, elementStartY }: any =
        await getGenerateReportPrompt(postData, taskFrame.id, nodeId, 0);

      const response = await requestAIModelAndProcessResponse(prompt, afterImageId, modelInstance);
      if (response.success && response.data) {
        await generateReportResult(response.data, previewFrameId, beforeImageId, elemList, 0, taskFrame.id, elementStartX, elementStartY);
      } else {
        errorMessageHandler(response.error || 'Failed to get response');
      }
    }

    figma.ui.postMessage({ type: 'loading', message: false });
    figma.notify('Analysis completed', { timeout: 3000 });
  } catch (error) {
    figma.ui.postMessage({ type: 'loading', message: false });
    console.error(error);
    errorMessageHandler(error.message || 'An unexpected error occurred');
  }
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'submit') {
    const postData: PostData = msg.data;
    await generateReport(postData, modelInstance);
  }

  if (msg.type === 'moveFocus') {
    const nodeId: string = msg.data;
    figma.getNodeByIdAsync(nodeId).then((node) => {
      if (node) figma.viewport.scrollAndZoomIntoView([node]);
    }).catch(console.error);
  }

  if (msg.type === 'saveApiKey') {
    const { apiKey } = msg.data;
    await updateAndSendApiKey(apiKey);
  }

  if (msg.type === 'deleteApiKey') {
    await figma.clientStorage.deleteAsync('geminiApiKey');
    updateAIConfig({ apiKey: '' });
    modelInstance = createModelInstance(aiConfig);
    figma.ui.postMessage({
      type: 'config',
      message: { geminiApiKey: '', provider: 'Gemini' },
    });
    figma.notify(`Gemini API key has been deleted`, { timeout: 2000 });
  }

  if (msg.type === 'errorMessage') {
    errorMessageHandler(msg.data);
  }
};
