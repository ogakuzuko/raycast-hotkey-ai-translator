import { Detail } from "@raycast/api";
import { useSelectedText } from "./hooks/useSelectedText";
import { generateMarkdown } from "./utils/markdown";

export default function Command() {
  const { selectedText, isLoading, error } = useSelectedText();
  const markdown = generateMarkdown(selectedText, isLoading, error);

  return <Detail markdown={markdown} isLoading={isLoading} />;
}
