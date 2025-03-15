import { Detail } from "@raycast/api";
import { useSelectedText } from "./hooks/useSelectedText";

export default function Command() {
  const { markdown, isLoading } = useSelectedText();

  return <Detail markdown={markdown} isLoading={isLoading} />;
}
