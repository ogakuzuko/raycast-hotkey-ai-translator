import { Detail, LaunchProps } from "@raycast/api";

export default function Command(props: LaunchProps) {
  console.log(`🔄 TranslateTextCommand: レンダリングされました（現在時刻：${new Date()}）`);
  console.log("LaunchProps.launchContext", props.launchContext);

  const markdown = `## 翻訳対象テキスト\n\n\`\`\`\n${props.launchContext?.inputText}\n\`\`\``;

  return <Detail markdown={markdown} isLoading={false} />;
}
