export type CombineResponse = {
  result: string;
  color: string;
  explanation?: string;
  emoji: string;
};

export async function combineElements(left: string, right: string) {
  const response = await fetch("/api/combine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ left, right }),
  });

  return response.json() as Promise<CombineResponse>;
}
