export function generateSKU({
  productName,
  options,
  batch = 0,
}: {
  productName: string;
  options: Record<string, string>;
  batch?: number;
}) {
  const prefix = productName.split(' ')[0].toUpperCase().slice(0, 6);

  const optionParts = Object.entries(options)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => {
      return value.toUpperCase().slice(0, 3);
    });

  const batchCode = `B${batch}`;

  return [prefix, ...optionParts, batchCode].join('-');
}
