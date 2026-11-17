type SerializedNode = string | { tag: string; attributes: Record<string, string>; children: SerializedNode[] }

function serialize(node: Node | null | undefined): SerializedNode | null {
  // TODO
  return null
}
