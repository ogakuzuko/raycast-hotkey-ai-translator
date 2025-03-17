import { Detail, LaunchProps } from "@raycast/api";

export default function Command(props: LaunchProps) {
  console.log(`🧠 AITranslateCommand: レンダリングされました（現在時刻：${new Date()}）`);
  console.log("LaunchProps.launchContext", props.launchContext);

  const markdown = `## 選択されたテキスト\n\n\`\`\`\n${props.launchContext?.inputText}\n\`\`\``;

  return <Detail markdown={markdown} isLoading={false} />;
}
