import { PostData } from '../UsabilityTester.type';
import { createPreviewAndImageFrames, getImage } from './utils/FigmaUtils';
import { DEBUG_PERF } from './controller';

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
                const t0 = DEBUG_PERF ? Date.now() : 0;
                // Anatomy Marker와 함께 이미지 생성. roundsContainer를 두 번째 인자로 전달하여 가로 배치가 되도록 함.
                const { previewFrame, afterImage, elemList, elementStartX, elementStartY, imageBytes } =
                    await createPreviewAndImageFrames(node, roundsContainer, i + 1);
                const t1 = DEBUG_PERF ? Date.now() : 0;

                // Base64 변환 (API 전송용)
                const afterImageBase64 = await getImage(afterImage.id);
                const t2 = DEBUG_PERF ? Date.now() : 0;

                if (DEBUG_PERF) {
                    console.log(
                        `[perf] Step ${i + 1} createPreviewAndImageFrames: ${Math.round(t1 - t0)}ms, getImage(base64): ${Math.round(t2 - t1)}ms`
                    );
                }

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
