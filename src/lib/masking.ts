// 個人情報マスキング（クライアントサイド実行）

interface MaskingResult {
  masked: string;
  replacements: { original: string; replacement: string }[];
}

export function maskPersonalInfo(text: string): MaskingResult {
  const replacements: { original: string; replacement: string }[] = [];
  let masked = text;
  let nameIndex = 0;
  const nameLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // 人名パターン（〜くん、〜ちゃん、〜さん）
  const namePattern = /[ぁ-ん一-龯ァ-ン]{1,5}(くん|ちゃん|さん|君)/g;
  const foundNames = new Map<string, string>();

  masked = masked.replace(namePattern, (match) => {
    if (!foundNames.has(match)) {
      const label = `[子ども${nameLabels[nameIndex % 26]}]`;
      foundNames.set(match, label);
      replacements.push({ original: match, replacement: label });
      nameIndex++;
    }
    return foundNames.get(match)!;
  });

  // カタカナ2〜5文字（固有名詞）
  const katakanaPattern = /[ァ-ヶー]{2,5}/g;
  masked = masked.replace(katakanaPattern, (match) => {
    if (!foundNames.has(match)) {
      const label = `[子ども${nameLabels[nameIndex % 26]}]`;
      foundNames.set(match, label);
      replacements.push({ original: match, replacement: label });
      nameIndex++;
    }
    return foundNames.get(match)!;
  });

  // 園名パターン
  const facilityPattern = /.{1,10}(保育園|幼稚園|こども園|認定こども園)/g;
  masked = masked.replace(facilityPattern, (match) => {
    replacements.push({ original: match, replacement: "[園名]" });
    return "[園名]";
  });

  return { masked, replacements };
}
