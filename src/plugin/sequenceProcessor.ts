import { PostData } from '../UsabilityTester.type';
import { createPreviewAndImageFrames, getImage } from './utils/FigmaUtils';

export interface SequenceStepResult {
    nodeId: string;
    imageBytes: Uint8Array;
    labeledImageBytes: Uint8Array;
    elemList: any[];
    previewFrameId: string;
    labeledFrameId: string;
    afterImageBase64: string;
    elementStartX: number;
    elementStartY: number;
}

export class SequenceProcessor {
    async processSequence(postData: PostData, taskFrameId: string): Promise<SequenceStepResult[]> {
        const results: SequenceStepResult[] = [];
        const taskFrame = (await figma.getNodeByIdAsync(taskFrameId)) as FrameNode;

        // Analysis Rounds 컨테이너 찾기 (없으면 taskFrame 사용)
        const roundsContainer = taskFrame.findChild(n => n.name === 'Analysis Rounds') as FrameNode || taskFrame;

        for (let i = 0; i < postData.nodeIds.length; i++) {
            const nodeId = postData.nodeIds[i];
            const node = (await figma.getNodeByIdAsync(nodeId)) as SceneNode;

            if (node) {
                // Anatomy Marker와 함께 이미지 생성. roundsContainer를 두 번째 인자로 전달하여 가로 배치가 되도록 함.
                const { previewFrame, afterImage, elemList, beforeImage, elementStartX, elementStartY } = await createPreviewAndImageFrames(node, roundsContainer, i + 1);

                // beforeImage에서 이미지 바이트 추출 (Action Labeling에서 재사용 가능)
                const imageBytes = await beforeImage.exportAsync({ format: 'PNG' });

                // Base64 변환 (API 전송용)
                const afterImageBase64 = await getImage(afterImage.id);

                results.push({
                    nodeId,
                    imageBytes, // Store for later action labeling
                    labeledImageBytes: new Uint8Array(), // Placeholder
                    elemList,
                    previewFrameId: previewFrame.id,
                    labeledFrameId: afterImage.id,
                    afterImageBase64,
                    elementStartX,
                    elementStartY
                });
            }
        }

        return results;
    }
}
