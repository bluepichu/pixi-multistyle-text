/// <reference types="pixi.js" />
export interface ExtendedTextStyle extends PIXI.TextStyleOptions {
    valign?: "top" | "middle" | "bottom";
}
export interface TextStyleSet {
    [key: string]: ExtendedTextStyle;
}
export default class MultiStyleText extends PIXI.Text {
    private static DEFAULT_TAG_STYLE;
    private textStyles;
    constructor(text: string, styles: TextStyleSet);
    styles: TextStyleSet;
    setTagStyle(tag: string, style: ExtendedTextStyle): void;
    deleteTagStyle(tag: string): void;
    private _getTextDataPerLine(lines);
    private getFontString(style);
    private createTextData(text, style);
    private getDropShadowPadding();
    updateText(): void;
    protected wordWrap(text: string): string;
    protected updateTexture(): void;
    private assign(destination, ...sources);
}
