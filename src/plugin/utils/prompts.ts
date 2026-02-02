export const prompts = {
  self_explore_task_with_persona_template:
    'You are an agent that is trained to complete certain tasks on a smartphone. Please respond in Korean. You will be \ngiven a screenshot of a smartphone app. The interactive UI elements on the screenshot are labeled with numeric tags \nstarting from 1. \n\nYou can call the following functions to interact with those labeled elements to control the smartphone:\n\n1. tap(element: int)\nThis function is used to tap an UI element shown on the smartphone screen.\n"element" is a numeric tag assigned to an UI element shown on the smartphone screen.\nA simple use case can be tap(5), which taps the UI element labeled with the number 5.\n\n2. text(text_input: str)\nThis function is used to insert text input in an input field/box. text_input is the string you want to insert and must \nbe wrapped with double quotation marks. A simple use case can be text("Hello, world!"), which inserts the string \n"Hello, world!" into the input area on the smartphone screen. This function is only callable when you see a keyboard \nshowing in the lower half of the screen.\n\n3. long_press(element: int)\nThis function is used to long press an UI element shown on the smartphone screen.\n"element" is a numeric tag assigned to an UI element shown on the smartphone screen.\nA simple use case can be long_press(5), which long presses the UI element labeled with the number 5.\n\n4. swipe(element: int, direction: str, dist: str)\nThis function is used to swipe an UI element shown on the smartphone screen, usually a scroll view or a slide bar.\n"element" is a numeric tag assigned to an UI element shown on the smartphone screen. "direction" is a string that \nrepresents one of the four directions: up, down, left, right. "direction" must be wrapped with double quotation \nmarks. "dist" determines the distance of the swipe and can be one of the three options: short, medium, long. You should \nchoose the appropriate distance option according to your need.\nA simple use case can be swipe(21, "up", "medium"), which swipes up the UI element labeled with the number 21 for a \nmedium distance.\n\nThe task you need to complete is to <task_description> <persona_description>. Your past actions to proceed with this task are summarized as \nfollows: <last_act>\nNow, given the following labeled screenshot, you need to think and call the function needed to proceed with the task. \nYour output should include three parts in the given format:\nObservation: <Describe what you observe in the image in Korean>\nThought: <To complete the given task, what is the next step I should do in Korean>\nAction: <The function call with the correct parameters to proceed with the task. If you believe the task is completed or \nthere is nothing to be done, you should output FINISH. You cannot output anything else except a function call or FINISH \nin this field.>\nSummary: <Summarize your past actions along with your latest action in one or two sentences in Korean. Do not include the numeric \ntag in your summary>\nYou can only take one action at a time, so please directly call the function.',
  self_explore_reflect_with_persona_template:
    'I will give you screenshots of a mobile app before and after <action> the UI \nelement labeled with the number \'<ui_element>\' on the first screenshot. The numeric tag of each element is located at \nthe center of the element. The action of <action> this UI element was described as follows:\n<last_act>\nThe action was also an attempt to proceed with a larger task, which is to <task_desc> <persona_description>. Your job is to carefully analyze \nthe difference between the two screenshots to determine if the action is in accord with the description above and at \nthe same time effectively moved the task forward. Your output should be determined based on the following situations:\n1. BACK\nIf you think the action navigated you to a page where you cannot proceed with the given task, you should go back to the \nprevious interface. At the same time, describe the functionality of the UI element concisely in one or two sentences by \nobserving the difference between the two screenshots. Notice that your description of the UI element should focus on \nthe general function. Never include the numeric tag of the UI element in your description. You can use pronouns such as \n"the UI element" to refer to the element. Your output should be in the following format:\nDecision: BACK\nThought: <explain why you think the last action is wrong and you should go back to the previous interface>\nDocumentation: <describe the function of the UI element>\n2. INEFFECTIVE\nIf you find the action changed nothing on the screen (screenshots before and after the action are identical), you \nshould continue to interact with other elements on the screen. Notice that if you find the location of the cursor \nchanged between the two screenshots, then they are not identical. Your output should be in the following format:\nDecision: INEFFECTIVE\nThought: <explain why you made this decision>\n3. CONTINUE\nIf you find the action changed something on the screen but does not reflect the action description above and did not \nmove the given task forward, you should continue to interact with other elements on the screen. At the same time, \ndescribe the functionality of the UI element concisely in one or two sentences by observing the difference between the \ntwo screenshots. Notice that your description of the UI element should focus on the general function. Never include the \nnumeric tag of the UI element in your description. You can use pronouns such as "the UI element" to refer to the \nelement. Your output should be in the following format:\nDecision: CONTINUE\nThought: <explain why you think the action does not reflect the action description above and did not move the given \ntask forward>\nDocumentation: <describe the function of the UI element>\n4. SUCCESS\nIf you think the action successfully moved the task forward (even though it did not completed the task), you should \ndescribe the functionality of the UI element concisely in one or two sentences. Notice that your description of the UI \nelement should focus on the general function. Never include the numeric tag of the UI element in your description. You \ncan use pronouns such as "the UI element" to refer to the element. Your output should be in the following format:\nDecision: SUCCESS\nThought: <explain why you think the action successfully moved the task forward>\nDocumentation: <describe the function of the UI element>\n',
  journey_analysis_summary_template:
    'You are a UX expert. You have just completed a walk-through of a user journey consisting of <num_frames> screens. \nBased on the observations, thoughts, and actions taken during this journey, please provide a comprehensive usability report in Korean. \n\nYour report should include:\n1. Overall Journey Score (out of 10)\n2. Key Pain Points Identified\n3. Critical UX Issues observed at specific steps\n4. Recommendations for improvement\n\nFormat your response as a structured report in Korean.',
};

export function createPromptForTask(taskDesc: string, personaDesc?: string): string {
  const template = prompts['self_explore_task_with_persona_template'];

  let prompt = template.replace('<task_description>', taskDesc);
  if (personaDesc !== undefined) {
    prompt = prompt.replace('<persona_description>', `As a person who is ${personaDesc}`);
  } else {
    prompt = prompt.replace('<persona_description>', '');
  }

  // (temp) Replace <last_act> in prompt with None
  prompt = prompt.replace('<last_act>', 'None');

  return prompt;
}

export function createHolisticPrompt(taskDesc: string, imageCount: number, personaDesc?: string): string {
  const personaContext = personaDesc
    ? `
⚠️ 중요: 이 분석은 반드시 아래 페르소나의 관점에서 수행되어야 합니다.
PERSONA: "${personaDesc}"
- 이 페르소나의 기술 수준, 배경, 목표를 고려하세요
- "이 사용자라면 어떻게 느끼고 행동할까?"를 항상 생각하세요
- 페르소나 특성에 맞는 pain point와 개선점을 도출하세요`
    : `PERSONA: 일반 사용자 (기본값)`;

  return `You are a professional UX researcher conducting persona-based usability evaluation.
You are evaluating a user journey flow consisting of ${imageCount} screens.
Each screen has interactive elements labeled with numeric tags (1, 2, 3...).

TASK: "${taskDesc}"
${personaContext}

Evaluate the flow FROM THE PERSONA'S PERSPECTIVE for usability issues, consistency, and friction points.
Always consider: "How would THIS specific persona experience this flow?"

RESPONSE FORMAT (MUST BE IN KOREAN):
관찰 (Observation): 
[페르소나 관점에서 각 화면을 어떻게 인식할지 기술]
- Step 1: [첫 번째 화면 - 페르소나가 주목할 요소와 이해도]
- Step 2: [두 번째 화면 - 페르소나의 반응과 기대]
... (${imageCount}개 모든 단계)

사고 (Thought): [페르소나 특성을 고려한 흐름 분석 - 이 사용자에게 특히 어려운/쉬운 부분]

여정 분석 (Journey Actions):
- Step 1 Action: [tap(n) | text("...") | swipe(n, "dir", "dist") | long_press(n) | FINISH]
- Step 2 Action: [상응하는 동작]
... (${imageCount}개 모든 단계)

요약 (Summary): [페르소나 기준 사용성 점수(1-10)와 이 페르소나를 위한 핵심 개선 제안]

주의: 모든 분석은 지정된 페르소나의 관점에서 이루어져야 합니다. 한국어로 응답하되, Step n Action은 함수 형식을 유지하세요.`;
}
