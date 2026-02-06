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


// Send key and selection when the UI is loaded
async function sendApiKeyAndNodeInfoToUI() {
  const geminiApiKey = (await figma.clientStorage.getAsync('geminiApiKey')) || '';
  const currentProvider = 'Gemini';
  if (geminiApiKey) updateAIConfig({ apiKey: geminiApiKey, provider: 'Gemini' });
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

  // Helper: clean markdown formatting
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*[:：]?\s*/g, '')  // Remove **:
      .replace(/\*\*/g, '')           // Remove remaining **
      .replace(/^\s*-\s*/gm, '')      // Remove leading dashes
      .replace(/^\s*[:：]\s*/gm, '')  // Remove leading colons
      .trim();
  };

  // 섹션별 직접 파싱 (더 단순하고 명확하게)
  const extractSection = (headerRegex: RegExp, nextHeaderRegex?: RegExp): string => {
    const match = data.match(headerRegex);
    if (!match) return '';

    const startIndex = match.index! + match[0].length;
    let endIndex = data.length;

    if (nextHeaderRegex) {
      const nextMatch = data.substring(startIndex).match(nextHeaderRegex);
      if (nextMatch) {
        endIndex = startIndex + nextMatch.index!;
      }
    }

    return data.substring(startIndex, endIndex).trim();
  };

  // 각 섹션 파싱
  const visualVerification = extractSection(
    /###\s*시각적\s*사실\s*확인\s*\(Visual Verification\)\s*\n/i,
    /###\s*(?:첫\s*마디|관찰|Observation|사고|Thought)/i
  );

  const firstImpression = extractSection(
    /###\s*첫\s*마디\s*(?:\(First Impression\))?\s*\n/i,
    /###\s*(?:관찰|Observation|사고|Thought)/i
  );

  const observationSection = extractSection(
    /###\s*관찰\s*\(Observation\)\s*\n/i,
    /###\s*(?:사고|Thought|여정|Journey|Action|행동)/i
  );

  const thoughtSection = extractSection(
    /###\s*사고\s*\(Thought\)\s*\n/i,
    /###\s*(?:여정|Journey|Action|행동|이슈|Issues)/i
  );

  const actionsSection = extractSection(
    /###\s*여정\s*분석\s*\(Journey Actions\)\s*\n/i,
    /###\s*(?:이슈|Issues|UX|요약|Summary)/i
  );

  const issuesSection = extractSection(
    /###\s*UX\s+이슈\s*\(Issues\)\s*\n/i,
    /###\s*요약/i
  );

  const summarySection = extractSection(
    /###\s*요약\s*\(Summary\)\s*\n/i
  );

  // 🔍 디버깅: AI 응답 원본 및 파싱 결과 확인
  console.log('=== AI 응답 원본 (처음 500자) ===');
  console.log(data.substring(0, 500));
  console.log('\n=== 파싱 결과 ===');
  console.log('visualVerification:', visualVerification ? `${visualVerification.substring(0, 100)}...` : '❌ 비어있음');
  console.log('firstImpression:', firstImpression ? `${firstImpression.substring(0, 100)}...` : '❌ 비어있음');
  console.log('observationSection:', observationSection ? `${observationSection.substring(0, 100)}...` : '❌ 비어있음');
  console.log('thoughtSection:', thoughtSection ? `${thoughtSection.substring(0, 100)}...` : '❌ 비어있음');
  console.log('actionsSection:', actionsSection ? `${actionsSection.substring(0, 100)}...` : '❌ 비어있음');
  console.log('issuesSection:', issuesSection ? `${issuesSection.substring(0, 100)}...` : '❌ 비어있음');
  console.log('summarySection:', summarySection ? `${summarySection.substring(0, 100)}...` : '❌ 비어있음');

  const stepActions: string[] = [];
  const stepObservations: string[] = [];
  const stepThoughts: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const stepNum = i + 1; // Step 1, Step 2, ...
    const stepRegex = new RegExp(`(?:-?\\s*Step\\s*${stepNum}|${stepNum}\\s*단계)[:：]?\\s*([\\s\\S]*?)(?=(?:-?\\s*Step\\s*\\d+|\\d+\\s*단계)|(?:###?\\s*(?:Thought|사고|Journey|여정|Issues|이슈|Summary|요약))|$)`, 'i');

    // Actions
    let foundAction = '';
    if (actionsSection) {
      const match = actionsSection.match(stepRegex);
      if (match && match[1].trim()) foundAction = match[1].trim();
    }
    if (!foundAction) {
      const match = data.match(new RegExp(`(?:Step\\s*${stepNum}|${stepNum}\\s*단계).*?((?:tap|swipe|text|long_press)\\s*\\([^)]+\\))`, 'is'));
      if (match) foundAction = match[1].trim();
    }
    stepActions.push(foundAction || 'FINISH');

    // Observations
    const obsMatch = observationSection.match(stepRegex);
    stepObservations.push(cleanMarkdown(obsMatch ? obsMatch[1] : ''));

    // Thoughts
    const thoughtMatch = thoughtSection.match(stepRegex);
    stepThoughts.push(cleanMarkdown(thoughtMatch ? thoughtMatch[1] : ''));
  }

  // 🔍 디버깅: 각 단계별 행동 확인
  console.log('\n=== 단계별 행동 (stepActions) ===');
  stepActions.forEach((action, idx) => {
    console.log(`Step ${idx + 1}:`, action);
  });

  // Combined loop: for each result, add labeled_action THEN Step Analysis (correct order)
  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    const labeledFrame = (await figma.getNodeByIdAsync(res.labeledFrameId)) as FrameNode;
    const previewFrame = (await figma.getNodeByIdAsync(res.previewFrameId)) as FrameNode;

    if (previewFrame) {
      // 1. First add labeled_action frame (if applicable)
      let actionStr = stepActions[i] || '';

      // 🔍 디버깅: 각 단계의 actionStr 확인
      console.log(`\nStep ${i + 1} actionStr (원본):`, actionStr);

      // "- Step 1 Action: tap(상세 보기)" 형태에서 "tap(상세 보기)" 부분만 추출
      const actionMatch = actionStr.match(/(tap|swipe|text|long_press)\s*\([^)]+\)/i);
      if (actionMatch) {
        actionStr = actionMatch[0];
        console.log(`Step ${i + 1} actionStr (추출):`, actionStr);
      }

      // 한글 설명이 있는 경우 (예: tap(상세 보기)), 원본 데이터에서 실제 숫자 찾기
      if (actionStr && !/\d/.test(actionStr)) {
        // 숫자가 없으면 원본 데이터에서 해당 Step의 실제 함수 호출 찾기
        const stepNum = i + 1;
        const realActionMatch = data.match(new RegExp(`Step\\s*${stepNum}.*?((?:tap|swipe|text|long_press)\\s*\\(\\d+[^)]*\\))`, 'is'));
        if (realActionMatch) {
          actionStr = realActionMatch[1];
          console.log(`Step ${i + 1} actionStr (실제 숫자 추출):`, actionStr);
        }
      }

      if (labeledFrame && actionStr && !actionStr.includes('FINISH')) {
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
        obsFrame.layoutSizingHorizontal = 'FILL';

        const thought = stepThoughts[i] || `Step ${i + 1} 사고 내용 없음`;
        const thoughtFrame = createTextFrame(`사고 (Step ${i + 1})`, thought);
        stepResultFrame.appendChild(thoughtFrame);
        thoughtFrame.layoutSizingHorizontal = 'FILL';

        // FINISH 단계에서는 Action 표시하지 않음 (Observation만 표시)
        const cleanedAction = cleanMarkdown(stepActions[i] || 'FINISH');
        if (!cleanedAction.includes('FINISH')) {
          const actionFrame = createTextFrame('행동 (Action)', cleanedAction);
          stepResultFrame.appendChild(actionFrame);
          actionFrame.layoutSizingHorizontal = 'FILL'; // Set AFTER appendChild
        }

        previewFrame.appendChild(stepResultFrame);
      }
    }
  }

  // === Analysis Summary 구성 (Issues 중심) ===
  const resFrame = figma.createFrame();
  resFrame.name = 'Analysis Summary';
  resFrame.fills = [];
  resFrame.cornerRadius = 16;
  resFrame.layoutMode = 'VERTICAL';
  resFrame.itemSpacing = 48;
  resFrame.paddingTop = resFrame.paddingBottom = resFrame.paddingLeft = resFrame.paddingRight = 64;
  resFrame.primaryAxisSizingMode = 'AUTO';
  resFrame.counterAxisSizingMode = 'AUTO';

  if (visualVerification) resFrame.appendChild(createTextFrame('시각적 사실 확인 (Visual Verification)', visualVerification));
  if (firstImpression) resFrame.appendChild(createTextFrame('첫 마디 (First Impression)', firstImpression));
  if (actionsSection) resFrame.appendChild(createTextFrame('사용자 여정 및 행동 (User Journey & Actions)', actionsSection));
  if (issuesSection) resFrame.appendChild(createTextFrame('주요 UX 이슈 (Issues)', issuesSection));
  if (summarySection) resFrame.appendChild(createTextFrame('종합 요약 (Summary)', summarySection));

  if (!visualVerification && !firstImpression && !actionsSection && !issuesSection && !summarySection) {
    resFrame.appendChild(createTextFrame('분석 결과 (Analysis Result)', data.trim()));
  }

  // Header 프레임 찾아서 Analysis Summary 추가 (상단에 배치되도록)
  const findFrame = (parent: FrameNode, name: string): FrameNode | null => {
    const directChild = parent.findChild(n => n.name === name) as FrameNode;
    if (directChild) return directChild;
    for (const child of parent.children) {
      if ('findChild' in child) {
        const found = (child as FrameNode).findChild(n => n.name === name) as FrameNode;
        if (found) return found;
      }
    }
    return null;
  };

  const headerFrame = findFrame(taskFrame, 'Header');
  if (headerFrame) headerFrame.appendChild(resFrame);
  else taskFrame.appendChild(resFrame);

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
      const { prompt, previewFrameId, afterImageId, elemList, elementStartX, elementStartY, imageBytes }: any =
        await getGenerateReportPrompt(postData, taskFrame.id, nodeId, 0);

      const response = await requestAIModelAndProcessResponse(prompt, afterImageId, modelInstance);
      if (response.success && response.data) {
        await generateReportResult(response.data, previewFrameId, elemList, 0, taskFrame.id, elementStartX, elementStartY, imageBytes);
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
    const selectedModel = postData.selectedModel || 'gemini-3-flash-preview';

    // 선택된 모델로 인스턴스 생성
    const tempConfig = { ...aiConfig, geminiApiModel: selectedModel };
    const tempModelInstance = createModelInstance(tempConfig);

    await generateReport(postData, tempModelInstance);
  }

  if (msg.type === 'moveFocus') {
    const nodeId: string = msg.data;
    figma.getNodeByIdAsync(nodeId).then((node) => {
      if (node) figma.viewport.scrollAndZoomIntoView([node]);
    }).catch(console.error);
  }

  if (msg.type === 'saveApiKey') {
    const { apiKey } = msg.data;
    await figma.clientStorage.setAsync('geminiApiKey', apiKey);
    updateAIConfig({ apiKey: apiKey });
    figma.ui.postMessage({ type: 'config', message: aiConfig });
    figma.notify('API Key saved successfully', { timeout: 3000 });
  }

  if (msg.type === 'deleteApiKey') {
    await figma.clientStorage.deleteAsync('geminiApiKey');
    updateAIConfig({ apiKey: '' });
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
