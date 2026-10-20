declare module "react-native-syntax-highlighter" {
  import type { StyleProp, TextStyle, ViewStyle } from "react-native";
  import type { ReactNode } from "react";

  type SyntaxStyle = Record<string, Record<string, string | number>>;

  type SyntaxHighlighterProps = {
    children: string;
    language?: string;
    style?: SyntaxStyle;
    fontFamily?: string;
    fontSize?: number;
    wrapLongLines?: boolean;
    customStyle?: StyleProp<ViewStyle | TextStyle>;
  };

  const SyntaxHighlighter: (props: SyntaxHighlighterProps) => ReactNode;
  export default SyntaxHighlighter;
}

declare module "react-syntax-highlighter/styles/hljs/atom-one-dark" {
  const style: Record<string, Record<string, string | number>>;
  export default style;
}
