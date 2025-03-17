import { getSelectedText, launchCommand, LaunchType } from "@raycast/api";

/**
 * MEMO: 別にnameとtitleは別々にできるんだから、name:get-selected-text-for-summarize、title:Quick Summarizeとかでもいいじゃんね。もうちょっと考えたい。
 * TODO: [Issueに追加しておく] Summarizeの方はちょっとあとで考えようかな。短文選択して要約したいってなるケースは少ないから、要約は要約で別の拡張機能としたい（RaycastのAPIにbrowserの見ているタブを扱えるやつ合った気がするのでそれとか使うと良さそう。このAPI使えるの確かProプランだけだったかもしれない？）。
 */

export default async function Command() {
  // TODO: 選択中のテキスト取得関数は、要約Commandと翻訳Commandで共通関数として定義し直して共通利用するようにする。
  const selectedText = await getSelectedText();
  console.log(`📝 SelectedTextGetCommand: 実行されました（現在時刻：${new Date()}）`);
  console.log("selectedText", selectedText);

  await launchCommand({
    name: "summarize-result-view-DO-NOT-USE-DIRECTLY",
    type: LaunchType.UserInitiated,
    context: {
      inputText: selectedText,
    },
  });
}
