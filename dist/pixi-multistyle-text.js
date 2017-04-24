(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MultiStyleText = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require("./pixi-multistyle-text").default;
},{"./pixi-multistyle-text":2}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MultiStyleText = (function (_super) {
        __extends(MultiStyleText, _super);
        function MultiStyleText(text, styles) {
            var _this = _super.call(this, text) || this;
            _this.styles = styles;
            return _this;
        }
        Object.defineProperty(MultiStyleText.prototype, "styles", {
            set: function (styles) {
                this.textStyles = {};
                this.textStyles["default"] = this.assign({}, MultiStyleText.DEFAULT_TAG_STYLE);
                for (var style in styles) {
                    if (style === "default") {
                        this.assign(this.textStyles["default"], styles[style]);
                    }
                    else {
                        this.textStyles[style] = this.assign({}, styles[style]);
                    }
                }
                this._style = new PIXI.TextStyle(this.textStyles["default"]);
                this.dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        MultiStyleText.prototype.setTagStyle = function (tag, style) {
            if (tag in this.textStyles) {
                this.assign(this.textStyles[tag], style);
            }
            else {
                this.textStyles[tag] = this.assign({}, style);
            }
            this._style = new PIXI.TextStyle(this.textStyles["default"]);
            this.dirty = true;
        };
        MultiStyleText.prototype.deleteTagStyle = function (tag) {
            if (tag === "default") {
                this.textStyles["default"] = this.assign({}, MultiStyleText.DEFAULT_TAG_STYLE);
            }
            else {
                delete this.textStyles[tag];
            }
            this._style = new PIXI.TextStyle(this.textStyles["default"]);
            this.dirty = true;
        };
        MultiStyleText.prototype._getTextDataPerLine = function (lines) {
            var outputTextData = [];
            var tags = Object.keys(this.textStyles).join("|");
            var re = new RegExp("</?(" + tags + ")>", "g");
            var styleStack = [this.assign({}, this.textStyles["default"])];
            for (var i = 0; i < lines.length; i++) {
                var lineTextData = [];
                var matches = [];
                var matchArray = void 0;
                while (matchArray = re.exec(lines[i])) {
                    matches.push(matchArray);
                }
                if (matches.length === 0) {
                    lineTextData.push(this.createTextData(lines[i], styleStack[styleStack.length - 1]));
                }
                else {
                    var currentSearchIdx = 0;
                    for (var j = 0; j < matches.length; j++) {
                        if (matches[j].index > currentSearchIdx) {
                            lineTextData.push(this.createTextData(lines[i].substring(currentSearchIdx, matches[j].index), styleStack[styleStack.length - 1]));
                        }
                        if (matches[j][0][1] === "/") {
                            if (styleStack.length > 1) {
                                styleStack.pop();
                            }
                        }
                        else {
                            styleStack.push(this.assign({}, styleStack[styleStack.length - 1], this.textStyles[matches[j][1]]));
                        }
                        currentSearchIdx = matches[j].index + matches[j][0].length;
                    }
                    if (currentSearchIdx < lines[i].length) {
                        lineTextData.push(this.createTextData(lines[i].substring(currentSearchIdx), styleStack[styleStack.length - 1]));
                    }
                }
                outputTextData.push(lineTextData);
            }
            return outputTextData;
        };
        MultiStyleText.prototype.getFontString = function (style) {
            return new PIXI.TextStyle(style).toFontString();
        };
        MultiStyleText.prototype.createTextData = function (text, style) {
            return {
                text: text,
                style: style,
                width: 0,
                height: 0,
                fontProperties: undefined
            };
        };
        MultiStyleText.prototype.getDropShadowPadding = function () {
            var _this = this;
            var maxDistance = 0;
            var maxBlur = 0;
            Object.keys(this.textStyles).forEach(function (styleKey) {
                var _a = _this.textStyles[styleKey], dropShadowDistance = _a.dropShadowDistance, dropShadowBlur = _a.dropShadowBlur;
                maxDistance = Math.max(maxDistance, dropShadowDistance || 0);
                maxBlur = Math.max(maxBlur, dropShadowBlur || 0);
            });
            return maxDistance + maxBlur;
        };
        MultiStyleText.prototype.updateText = function () {
            var _this = this;
            if (!this.dirty) {
                return;
            }
            this.texture.baseTexture.resolution = this.resolution;
            var textStyles = this.textStyles;
            var outputText = this.text;
            if (this._style.wordWrap) {
                outputText = this.wordWrap(this.text);
            }
            var lines = outputText.split(/(?:\r\n|\r|\n)/);
            var outputTextData = this._getTextDataPerLine(lines);
            var lineWidths = [];
            var lineHeights = [];
            var maxLineWidth = 0;
            for (var i = 0; i < lines.length; i++) {
                var lineWidth = 0;
                var lineHeight = 0;
                for (var j = 0; j < outputTextData[i].length; j++) {
                    if (outputTextData[i][j].text.length == 0) {
                        continue;
                    }
                    var sty = outputTextData[i][j].style;
                    this.context.font = this.getFontString(sty);
                    outputTextData[i][j].width = this.context.measureText(outputTextData[i][j].text).width + (outputTextData[i][j].text.length - 1) * sty.letterSpacing;
                    lineWidth += outputTextData[i][j].width;
                    if (j > 0) {
                        lineWidth += sty.letterSpacing / 2;
                    }
                    if (j < outputTextData[i].length - 1) {
                        lineWidth += sty.letterSpacing / 2;
                    }
                    outputTextData[i][j].fontProperties = PIXI.TextMetrics.measureFont(this.context.font);
                    outputTextData[i][j].height =
                        outputTextData[i][j].fontProperties.fontSize + outputTextData[i][j].style.strokeThickness;
                    lineHeight = Math.max(lineHeight, outputTextData[i][j].height);
                }
                lineWidths[i] = lineWidth;
                lineHeights[i] = lineHeight;
                maxLineWidth = Math.max(maxLineWidth, lineWidth);
            }
            var stylesArray = Object.keys(textStyles).map(function (key) { return textStyles[key]; });
            var maxStrokeThickness = stylesArray.reduce(function (prev, curr) { return Math.max(prev, curr.strokeThickness || 0); }, 0);
            var dropShadowPadding = this.getDropShadowPadding();
            var maxLineHeight = lineHeights.reduce(function (prev, curr) { return Math.max(prev, curr); }, 0);
            var width = maxLineWidth + maxStrokeThickness + 2 * dropShadowPadding;
            var height = (maxLineHeight * lines.length) + 2 * dropShadowPadding;
            this.canvas.width = (width + this.context.lineWidth) * this.resolution;
            this.canvas.height = height * this.resolution;
            this.context.scale(this.resolution, this.resolution);
            this.context.textBaseline = "alphabetic";
            this.context.lineJoin = "round";
            var basePositionY = dropShadowPadding;
            var drawingData = [];
            for (var i = 0; i < outputTextData.length; i++) {
                var line = outputTextData[i];
                var linePositionX = void 0;
                switch (this._style.align) {
                    case "left":
                        linePositionX = dropShadowPadding;
                        break;
                    case "center":
                        linePositionX = dropShadowPadding + (maxLineWidth - lineWidths[i]) / 2;
                        break;
                    case "right":
                        linePositionX = dropShadowPadding + maxLineWidth - lineWidths[i];
                        break;
                }
                for (var j = 0; j < line.length; j++) {
                    var _a = line[j], style = _a.style, text = _a.text, fontProperties = _a.fontProperties;
                    linePositionX += maxStrokeThickness / 2;
                    var linePositionY = maxStrokeThickness / 2 + basePositionY + fontProperties.ascent;
                    if (style.valign === "bottom") {
                        linePositionY += lineHeights[i] - line[j].height - (maxStrokeThickness - style.strokeThickness) / 2;
                    }
                    else if (style.valign === "middle") {
                        linePositionY += (lineHeights[i] - line[j].height) / 2 - (maxStrokeThickness - style.strokeThickness) / 2;
                    }
                    if (style.letterSpacing === 0) {
                        drawingData.push({
                            text: text,
                            style: style,
                            x: linePositionX,
                            y: linePositionY
                        });
                        linePositionX += line[j].width;
                    }
                    else {
                        this.context.font = this.getFontString(line[j].style);
                        for (var k = 0; k < text.length; k++) {
                            if (k > 0 || j > 0) {
                                linePositionX += style.letterSpacing / 2;
                            }
                            drawingData.push({
                                text: text.charAt(k),
                                style: style,
                                x: linePositionX,
                                y: linePositionY
                            });
                            linePositionX += this.context.measureText(text.charAt(k)).width;
                            if (k < text.length - 1 || j < line.length - 1) {
                                linePositionX += style.letterSpacing / 2;
                            }
                        }
                    }
                    linePositionX -= maxStrokeThickness / 2;
                }
                basePositionY += lineHeights[i];
            }
            this.context.save();
            drawingData.forEach(function (_a) {
                var style = _a.style, text = _a.text, x = _a.x, y = _a.y;
                if (!style.dropShadow) {
                    return;
                }
                _this.context.font = _this.getFontString(style);
                var dropFillStyle = style.dropShadowColor;
                if (typeof dropFillStyle === "number") {
                    dropFillStyle = PIXI.utils.hex2string(dropFillStyle);
                }
                _this.context.shadowColor = dropFillStyle;
                _this.context.shadowBlur = style.dropShadowBlur;
                _this.context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance * _this.resolution;
                _this.context.shadowOffsetY = Math.sin(style.dropShadowAngle) * style.dropShadowDistance * _this.resolution;
                _this.context.fillText(text, x, y);
            });
            this.context.restore();
            drawingData.forEach(function (_a) {
                var style = _a.style, text = _a.text, x = _a.x, y = _a.y;
                _this.context.font = _this.getFontString(style);
                var strokeStyle = style.stroke;
                if (typeof strokeStyle === "number") {
                    strokeStyle = PIXI.utils.hex2string(strokeStyle);
                }
                _this.context.strokeStyle = strokeStyle;
                _this.context.lineWidth = style.strokeThickness;
                var fillStyle = style.fill;
                if (typeof fillStyle === "number") {
                    fillStyle = PIXI.utils.hex2string(fillStyle);
                }
                else if (Array.isArray(fillStyle)) {
                    for (var i = 0; i < fillStyle.length; i++) {
                        var fill = fillStyle[i];
                        if (typeof fill === "number") {
                            fillStyle[i] = PIXI.utils.hex2string(fill);
                        }
                    }
                }
                _this.context.fillStyle = _this._generateFillStyle(new PIXI.TextStyle(style), [text]);
                if (style.stroke && style.strokeThickness) {
                    _this.context.strokeText(text, x, y);
                }
                if (style.fill) {
                    _this.context.fillText(text, x, y);
                }
            });
            this.updateTexture();
        };
        MultiStyleText.prototype.wordWrap = function (text) {
            var result = '';
            var tags = Object.keys(this.textStyles).join("|");
            var re = new RegExp("(</?(" + tags + ")>)", "g");
            var lines = text.split("\n");
            var wordWrapWidth = this._style.wordWrapWidth;
            var styleStack = [this.assign({}, this.textStyles["default"])];
            this.context.font = this.getFontString(this.textStyles["default"]);
            for (var i = 0; i < lines.length; i++) {
                var spaceLeft = wordWrapWidth;
                var words = lines[i].split(" ");
                for (var j = 0; j < words.length; j++) {
                    var parts = words[j].split(re);
                    for (var k = 0; k < parts.length; k++) {
                        if (re.test(parts[k])) {
                            result += parts[k];
                            if (parts[k][1] === "/") {
                                k++;
                                styleStack.pop();
                            }
                            else {
                                k++;
                                styleStack.push(this.assign({}, styleStack[styleStack.length - 1], this.textStyles[parts[k]]));
                            }
                            this.context.font = this.getFontString(styleStack[styleStack.length - 1]);
                            continue;
                        }
                        var partWidth = this.context.measureText(parts[k]).width;
                        if (this._style.breakWords && partWidth > wordWrapWidth) {
                            var characters = parts[k].split('');
                            if (j > 0 && k === 0) {
                                result += " ";
                                spaceLeft -= this.context.measureText(" ").width;
                            }
                            for (var c = 0; c < characters.length; c++) {
                                var characterWidth = this.context.measureText(characters[c]).width;
                                if (characterWidth > spaceLeft) {
                                    result += "\n" + characters[c];
                                    spaceLeft = wordWrapWidth - characterWidth;
                                }
                                else {
                                    if (j > 0 && k === 0 && c === 0) {
                                        result += " ";
                                    }
                                    result += characters[c];
                                    spaceLeft -= characterWidth;
                                }
                            }
                        }
                        else {
                            var paddedPartWidth = partWidth + (k === 0 ? this.context.measureText(" ").width : 0);
                            if (j === 0 || paddedPartWidth > spaceLeft) {
                                if (j > 0) {
                                    result += "\n";
                                }
                                result += parts[k];
                                spaceLeft = wordWrapWidth - partWidth;
                            }
                            else {
                                spaceLeft -= paddedPartWidth;
                                if (k === 0) {
                                    result += " ";
                                }
                                result += parts[k];
                            }
                        }
                    }
                }
                if (i < lines.length - 1) {
                    result += '\n';
                }
            }
            return result;
        };
        MultiStyleText.prototype.updateTexture = function () {
            var texture = this._texture;
            var dropShadowPadding = this.getDropShadowPadding();
            texture.baseTexture.hasLoaded = true;
            texture.baseTexture.resolution = this.resolution;
            texture.baseTexture.realWidth = this.canvas.width;
            texture.baseTexture.realHeight = this.canvas.height;
            texture.baseTexture.width = this.canvas.width / this.resolution;
            texture.baseTexture.height = this.canvas.height / this.resolution;
            texture.trim.width = texture.frame.width = this.canvas.width / this.resolution;
            texture.trim.height = texture.frame.height = this.canvas.height / this.resolution;
            texture.trim.x = -this._style.padding - dropShadowPadding;
            texture.trim.y = -this._style.padding - dropShadowPadding;
            texture.orig.width = texture.frame.width - (this._style.padding + dropShadowPadding) * 2;
            texture.orig.height = texture.frame.height - (this._style.padding + dropShadowPadding) * 2;
            this._onTextureUpdate();
            texture.baseTexture.emit('update', texture.baseTexture);
            this.dirty = false;
        };
        MultiStyleText.prototype.assign = function (destination) {
            var sources = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sources[_i - 1] = arguments[_i];
            }
            for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
                var source = sources_1[_a];
                for (var key in source) {
                    destination[key] = source[key];
                }
            }
            return destination;
        };
        return MultiStyleText;
    }(PIXI.Text));
    MultiStyleText.DEFAULT_TAG_STYLE = {
        align: "left",
        breakWords: false,
        dropShadow: false,
        dropShadowAngle: Math.PI / 6,
        dropShadowBlur: 0,
        dropShadowColor: "#000000",
        dropShadowDistance: 5,
        fill: "black",
        fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
        fontFamily: "Arial",
        fontSize: 26,
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 0,
        lineJoin: "miter",
        miterLimit: 10,
        padding: 0,
        stroke: "black",
        strokeThickness: 0,
        textBaseline: "alphabetic",
        wordWrap: false,
        wordWrapWidth: 100
    };
    exports.default = MultiStyleText;
});

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInBpeGktbXVsdGlzdHlsZS10ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ0VBLFlBQVksQ0FBQzs7SUErQmI7UUFBNEMsa0NBQVM7UUE4QnBELHdCQUFZLElBQVksRUFBRSxNQUFvQjtZQUE5QyxZQUNDLGtCQUFNLElBQUksQ0FBQyxTQUdYO1lBREEsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O1FBQ3RCLENBQUM7UUFFRCxzQkFBVyxrQ0FBTTtpQkFBakIsVUFBa0IsTUFBb0I7Z0JBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO2dCQUVyQixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUUvRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUMxQixFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN4RCxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNQLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3pELENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNB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QWMsRUFBRSxDQUFDO1FBQ2pCLGVBQWUsRUFBRSxTQUFTO1FBQzFCLGtCQUFrQixFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLE9BQU87UUFDYixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWU7UUFDcEQsVUFBVSxFQUFFLE9BQU87UUFDbkIsUUFBUSxFQUFFLEVBQUU7UUFDWixTQUFTLEVBQUUsUUFBUTtRQUNuQixXQUFXLEVBQUUsUUFBUTtRQUNyQixVQUFVLEVBQUUsUUFBUTtRQUNwQixhQUFhLEVBQUUsQ0FBQztRQUNoQixVQUFVLEVBQUUsQ0FBQztRQUNiLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFVBQVUsRUFBRSxFQUFFO1FBQ2QsT0FBTyxFQUFFLENBQUM7UUFDVixNQUFNLEVBQUUsT0FBTztRQUNmLGVBQWUsRUFBRSxDQUFDO1FBQ2xCLFlBQVksRUFBRSxZQUFZO1FBQzFCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsYUFBYSxFQUFFLEdBQUc7S0FDbEIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3BpeGktbXVsdGlzdHlsZS10ZXh0XCIpLmRlZmF1bHQ7IiwiLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJwaXhpLmpzXCIgLz5cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZW5kZWRUZXh0U3R5bGUgZXh0ZW5kcyBQSVhJLlRleHRTdHlsZU9wdGlvbnMge1xuXHR2YWxpZ24/OiBcInRvcFwiIHwgXCJtaWRkbGVcIiB8IFwiYm90dG9tXCI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGV4dFN0eWxlU2V0IHtcblx0W2tleTogc3RyaW5nXTogRXh0ZW5kZWRUZXh0U3R5bGU7XG59XG5cbmludGVyZmFjZSBGb250UHJvcGVydGllcyB7XG5cdGFzY2VudDogbnVtYmVyO1xuXHRkZXNjZW50OiBudW1iZXI7XG5cdGZvbnRTaXplOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBUZXh0RGF0YSB7XG5cdHRleHQ6IHN0cmluZztcblx0c3R5bGU6IEV4dGVuZGVkVGV4dFN0eWxlO1xuXHR3aWR0aDogbnVtYmVyO1xuXHRoZWlnaHQ6IG51bWJlcjtcblx0Zm9udFByb3BlcnRpZXM6IEZvbnRQcm9wZXJ0aWVzO1xufVxuXG5pbnRlcmZhY2UgVGV4dERyYXdpbmdEYXRhIHtcblx0dGV4dDogc3RyaW5nO1xuXHRzdHlsZTogRXh0ZW5kZWRUZXh0U3R5bGU7XG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNdWx0aVN0eWxlVGV4dCBleHRlbmRzIFBJWEkuVGV4dCB7XG5cdHByaXZhdGUgc3RhdGljIERFRkFVTFRfVEFHX1NUWUxFOiBFeHRlbmRlZFRleHRTdHlsZSA9IHtcblx0XHRhbGlnbjogXCJsZWZ0XCIsXG5cdFx0YnJlYWtXb3JkczogZmFsc2UsXG5cdFx0ZHJvcFNoYWRvdzogZmFsc2UsXG5cdFx0ZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcblx0XHRkcm9wU2hhZG93Qmx1cjogMCxcblx0XHRkcm9wU2hhZG93Q29sb3I6IFwiIzAwMDAwMFwiLFxuXHRcdGRyb3BTaGFkb3dEaXN0YW5jZTogNSxcblx0XHRmaWxsOiBcImJsYWNrXCIsXG5cdFx0ZmlsbEdyYWRpZW50VHlwZTogUElYSS5URVhUX0dSQURJRU5ULkxJTkVBUl9WRVJUSUNBTCxcblx0XHRmb250RmFtaWx5OiBcIkFyaWFsXCIsXG5cdFx0Zm9udFNpemU6IDI2LFxuXHRcdGZvbnRTdHlsZTogXCJub3JtYWxcIixcblx0XHRmb250VmFyaWFudDogXCJub3JtYWxcIixcblx0XHRmb250V2VpZ2h0OiBcIm5vcm1hbFwiLFxuXHRcdGxldHRlclNwYWNpbmc6IDAsXG5cdFx0bGluZUhlaWdodDogMCxcblx0XHRsaW5lSm9pbjogXCJtaXRlclwiLFxuXHRcdG1pdGVyTGltaXQ6IDEwLFxuXHRcdHBhZGRpbmc6IDAsXG5cdFx0c3Ryb2tlOiBcImJsYWNrXCIsXG5cdFx0c3Ryb2tlVGhpY2tuZXNzOiAwLFxuXHRcdHRleHRCYXNlbGluZTogXCJhbHBoYWJldGljXCIsXG5cdFx0d29yZFdyYXA6IGZhbHNlLFxuXHRcdHdvcmRXcmFwV2lkdGg6IDEwMFxuXHR9O1xuXG5cdHByaXZhdGUgdGV4dFN0eWxlczogVGV4dFN0eWxlU2V0O1xuXG5cdGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZywgc3R5bGVzOiBUZXh0U3R5bGVTZXQpIHtcblx0XHRzdXBlcih0ZXh0KTtcblxuXHRcdHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuXHR9XG5cblx0cHVibGljIHNldCBzdHlsZXMoc3R5bGVzOiBUZXh0U3R5bGVTZXQpIHtcblx0XHR0aGlzLnRleHRTdHlsZXMgPSB7fTtcblxuXHRcdHRoaXMudGV4dFN0eWxlc1tcImRlZmF1bHRcIl0gPSB0aGlzLmFzc2lnbih7fSwgTXVsdGlTdHlsZVRleHQuREVGQVVMVF9UQUdfU1RZTEUpO1xuXG5cdFx0Zm9yIChsZXQgc3R5bGUgaW4gc3R5bGVzKSB7XG5cdFx0XHRpZiAoc3R5bGUgPT09IFwiZGVmYXVsdFwiKSB7XG5cdFx0XHRcdHRoaXMuYXNzaWduKHRoaXMudGV4dFN0eWxlc1tcImRlZmF1bHRcIl0sIHN0eWxlc1tzdHlsZV0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy50ZXh0U3R5bGVzW3N0eWxlXSA9IHRoaXMuYXNzaWduKHt9LCBzdHlsZXNbc3R5bGVdKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9zdHlsZSA9IG5ldyBQSVhJLlRleHRTdHlsZSh0aGlzLnRleHRTdHlsZXNbXCJkZWZhdWx0XCJdKTtcblx0XHR0aGlzLmRpcnR5ID0gdHJ1ZTtcblx0fVxuXG5cdHB1YmxpYyBzZXRUYWdTdHlsZSh0YWc6IHN0cmluZywgc3R5bGU6IEV4dGVuZGVkVGV4dFN0eWxlKTogdm9pZCB7XG5cdFx0aWYgKHRhZyBpbiB0aGlzLnRleHRTdHlsZXMpIHtcblx0XHRcdHRoaXMuYXNzaWduKHRoaXMudGV4dFN0eWxlc1t0YWddLCBzdHlsZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudGV4dFN0eWxlc1t0YWddID0gdGhpcy5hc3NpZ24oe30sIHN0eWxlKTtcblx0XHR9XG5cblx0XHR0aGlzLl9zdHlsZSA9IG5ldyBQSVhJLlRleHRTdHlsZSh0aGlzLnRleHRTdHlsZXNbXCJkZWZhdWx0XCJdKTtcblx0XHR0aGlzLmRpcnR5ID0gdHJ1ZTtcblx0fVxuXG5cdHB1YmxpYyBkZWxldGVUYWdTdHlsZSh0YWc6IHN0cmluZyk6IHZvaWQge1xuXHRcdGlmICh0YWcgPT09IFwiZGVmYXVsdFwiKSB7XG5cdFx0XHR0aGlzLnRleHRTdHlsZXNbXCJkZWZhdWx0XCJdID0gdGhpcy5hc3NpZ24oe30sIE11bHRpU3R5bGVUZXh0LkRFRkFVTFRfVEFHX1NUWUxFKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGVsZXRlIHRoaXMudGV4dFN0eWxlc1t0YWddO1xuXHRcdH1cblxuXHRcdHRoaXMuX3N0eWxlID0gbmV3IFBJWEkuVGV4dFN0eWxlKHRoaXMudGV4dFN0eWxlc1tcImRlZmF1bHRcIl0pO1xuXHRcdHRoaXMuZGlydHkgPSB0cnVlO1xuXHR9XG5cblx0cHJpdmF0ZSBfZ2V0VGV4dERhdGFQZXJMaW5lIChsaW5lczogc3RyaW5nW10pIHtcblx0XHRsZXQgb3V0cHV0VGV4dERhdGE6IFRleHREYXRhW11bXSA9IFtdO1xuXHRcdGxldCB0YWdzID0gT2JqZWN0LmtleXModGhpcy50ZXh0U3R5bGVzKS5qb2luKFwifFwiKTtcblx0XHRsZXQgcmUgPSBuZXcgUmVnRXhwKGA8XFwvPygke3RhZ3N9KT5gLCBcImdcIik7XG5cblx0XHRsZXQgc3R5bGVTdGFjayA9IFt0aGlzLmFzc2lnbih7fSwgdGhpcy50ZXh0U3R5bGVzW1wiZGVmYXVsdFwiXSldO1xuXG5cdFx0Ly8gZGV0ZXJtaW5lIHRoZSBncm91cCBvZiB3b3JkIGZvciBlYWNoIGxpbmVcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgbGluZVRleHREYXRhOiBUZXh0RGF0YVtdID0gW107XG5cblx0XHRcdC8vIGZpbmQgdGFncyBpbnNpZGUgdGhlIHN0cmluZ1xuXHRcdFx0bGV0IG1hdGNoZXM6IFJlZ0V4cEV4ZWNBcnJheVtdID0gW107XG5cdFx0XHRsZXQgbWF0Y2hBcnJheTogUmVnRXhwRXhlY0FycmF5O1xuXG5cdFx0XHR3aGlsZSAobWF0Y2hBcnJheSA9IHJlLmV4ZWMobGluZXNbaV0pKSB7XG5cdFx0XHRcdG1hdGNoZXMucHVzaChtYXRjaEFycmF5KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gbWF0Y2gsIHdlIHN0aWxsIG5lZWQgdG8gYWRkIHRoZSBsaW5lIHdpdGggdGhlIGRlZmF1bHQgc3R5bGVcblx0XHRcdGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRsaW5lVGV4dERhdGEucHVzaCh0aGlzLmNyZWF0ZVRleHREYXRhKGxpbmVzW2ldLCBzdHlsZVN0YWNrW3N0eWxlU3RhY2subGVuZ3RoIC0gMV0pKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHQvLyBXZSBnb3QgYSBtYXRjaCEgYWRkIHRoZSB0ZXh0IHdpdGggdGhlIG5lZWRlZCBzdHlsZVxuXHRcdFx0XHRsZXQgY3VycmVudFNlYXJjaElkeCA9IDA7XG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgbWF0Y2hlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdC8vIGlmIGluZGV4ID4gMCwgaXQgbWVhbnMgd2UgaGF2ZSBjaGFyYWN0ZXJzIGJlZm9yZSB0aGUgbWF0Y2gsXG5cdFx0XHRcdFx0Ly8gc28gd2UgbmVlZCB0byBhZGQgaXQgd2l0aCB0aGUgZGVmYXVsdCBzdHlsZVxuXHRcdFx0XHRcdGlmIChtYXRjaGVzW2pdLmluZGV4ID4gY3VycmVudFNlYXJjaElkeCkge1xuXHRcdFx0XHRcdFx0bGluZVRleHREYXRhLnB1c2godGhpcy5jcmVhdGVUZXh0RGF0YShcblx0XHRcdFx0XHRcdFx0bGluZXNbaV0uc3Vic3RyaW5nKGN1cnJlbnRTZWFyY2hJZHgsIG1hdGNoZXNbal0uaW5kZXgpLFxuXHRcdFx0XHRcdFx0XHRzdHlsZVN0YWNrW3N0eWxlU3RhY2subGVuZ3RoIC0gMV1cblx0XHRcdFx0XHRcdCkpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChtYXRjaGVzW2pdWzBdWzFdID09PSBcIi9cIikgeyAvLyByZXNldCB0aGUgc3R5bGUgaWYgZW5kIG9mIHRhZ1xuXHRcdFx0XHRcdFx0aWYgKHN0eWxlU3RhY2subGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0XHRzdHlsZVN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIHNldCB0aGUgY3VycmVudCBzdHlsZVxuXHRcdFx0XHRcdFx0c3R5bGVTdGFjay5wdXNoKHRoaXMuYXNzaWduKHt9LCBzdHlsZVN0YWNrW3N0eWxlU3RhY2subGVuZ3RoIC0gMV0sIHRoaXMudGV4dFN0eWxlc1ttYXRjaGVzW2pdWzFdXSkpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIHVwZGF0ZSB0aGUgY3VycmVudCBzZWFyY2ggaW5kZXhcblx0XHRcdFx0XHRjdXJyZW50U2VhcmNoSWR4ID0gbWF0Y2hlc1tqXS5pbmRleCArIG1hdGNoZXNbal1bMF0ubGVuZ3RoO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gaXMgdGhlcmUgYW55IGNoYXJhY3RlciBsZWZ0P1xuXHRcdFx0XHRpZiAoY3VycmVudFNlYXJjaElkeCA8IGxpbmVzW2ldLmxlbmd0aCkge1xuXHRcdFx0XHRcdGxpbmVUZXh0RGF0YS5wdXNoKHRoaXMuY3JlYXRlVGV4dERhdGEoXG5cdFx0XHRcdFx0XHRsaW5lc1tpXS5zdWJzdHJpbmcoY3VycmVudFNlYXJjaElkeCksXG5cdFx0XHRcdFx0XHRzdHlsZVN0YWNrW3N0eWxlU3RhY2subGVuZ3RoIC0gMV1cblx0XHRcdFx0XHQpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRvdXRwdXRUZXh0RGF0YS5wdXNoKGxpbmVUZXh0RGF0YSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFRleHREYXRhO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRGb250U3RyaW5nKHN0eWxlOiBFeHRlbmRlZFRleHRTdHlsZSk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIG5ldyBQSVhJLlRleHRTdHlsZShzdHlsZSkudG9Gb250U3RyaW5nKCk7XG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZVRleHREYXRhKHRleHQ6IHN0cmluZywgc3R5bGU6IEV4dGVuZGVkVGV4dFN0eWxlKTogVGV4dERhdGEge1xuXHRcdHJldHVybiB7XG5cdFx0XHR0ZXh0LFxuXHRcdFx0c3R5bGUsXG5cdFx0XHR3aWR0aDogMCxcblx0XHRcdGhlaWdodDogMCxcblx0XHRcdGZvbnRQcm9wZXJ0aWVzOiB1bmRlZmluZWRcblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBnZXREcm9wU2hhZG93UGFkZGluZygpOiBudW1iZXIge1xuXHRcdGxldCBtYXhEaXN0YW5jZSA9IDA7XG5cdFx0bGV0IG1heEJsdXIgPSAwO1xuXG5cdFx0IE9iamVjdC5rZXlzKHRoaXMudGV4dFN0eWxlcykuZm9yRWFjaCgoc3R5bGVLZXkpID0+IHtcblx0XHRcdGxldCB7IGRyb3BTaGFkb3dEaXN0YW5jZSwgZHJvcFNoYWRvd0JsdXIgfSA9IHRoaXMudGV4dFN0eWxlc1tzdHlsZUtleV07XG5cdFx0XHRtYXhEaXN0YW5jZSA9IE1hdGgubWF4KG1heERpc3RhbmNlLCBkcm9wU2hhZG93RGlzdGFuY2UgfHwgMCk7XG5cdFx0XHRtYXhCbHVyID0gTWF0aC5tYXgobWF4Qmx1ciwgZHJvcFNoYWRvd0JsdXIgfHwgMCk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbWF4RGlzdGFuY2UgKyBtYXhCbHVyO1xuXHR9XG5cblx0cHVibGljIHVwZGF0ZVRleHQoKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLmRpcnR5KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnJlc29sdXRpb24gPSB0aGlzLnJlc29sdXRpb247XG5cdFx0bGV0IHRleHRTdHlsZXMgPSB0aGlzLnRleHRTdHlsZXM7XG5cdFx0bGV0IG91dHB1dFRleHQgPSB0aGlzLnRleHQ7XG5cblx0XHRpZih0aGlzLl9zdHlsZS53b3JkV3JhcCkge1xuXHRcdFx0b3V0cHV0VGV4dCA9IHRoaXMud29yZFdyYXAodGhpcy50ZXh0KTtcblx0XHR9XG5cblx0XHQvLyBzcGxpdCB0ZXh0IGludG8gbGluZXNcblx0XHRsZXQgbGluZXMgPSBvdXRwdXRUZXh0LnNwbGl0KC8oPzpcXHJcXG58XFxyfFxcbikvKTtcblxuXHRcdC8vIGdldCB0aGUgdGV4dCBkYXRhIHdpdGggc3BlY2lmaWMgc3R5bGVzXG5cdFx0bGV0IG91dHB1dFRleHREYXRhID0gdGhpcy5fZ2V0VGV4dERhdGFQZXJMaW5lKGxpbmVzKTtcblxuXHRcdC8vIGNhbGN1bGF0ZSB0ZXh0IHdpZHRoIGFuZCBoZWlnaHRcblx0XHRsZXQgbGluZVdpZHRoczogbnVtYmVyW10gPSBbXTtcblx0XHRsZXQgbGluZUhlaWdodHM6IG51bWJlcltdID0gW107XG5cdFx0bGV0IG1heExpbmVXaWR0aCA9IDA7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgbGluZVdpZHRoID0gMDtcblx0XHRcdGxldCBsaW5lSGVpZ2h0ID0gMDtcblx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgb3V0cHV0VGV4dERhdGFbaV0ubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0aWYgKG91dHB1dFRleHREYXRhW2ldW2pdLnRleHQubGVuZ3RoID09IDApIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBzdHkgPSBvdXRwdXRUZXh0RGF0YVtpXVtqXS5zdHlsZTtcblxuXHRcdFx0XHR0aGlzLmNvbnRleHQuZm9udCA9IHRoaXMuZ2V0Rm9udFN0cmluZyhzdHkpO1xuXG5cdFx0XHRcdC8vIHNhdmUgdGhlIHdpZHRoXG5cdFx0XHRcdG91dHB1dFRleHREYXRhW2ldW2pdLndpZHRoID0gdGhpcy5jb250ZXh0Lm1lYXN1cmVUZXh0KG91dHB1dFRleHREYXRhW2ldW2pdLnRleHQpLndpZHRoICsgKG91dHB1dFRleHREYXRhW2ldW2pdLnRleHQubGVuZ3RoIC0gMSkgKiBzdHkubGV0dGVyU3BhY2luZztcblx0XHRcdFx0bGluZVdpZHRoICs9IG91dHB1dFRleHREYXRhW2ldW2pdLndpZHRoO1xuXG5cdFx0XHRcdGlmIChqID4gMCkge1xuXHRcdFx0XHRcdGxpbmVXaWR0aCArPSBzdHkubGV0dGVyU3BhY2luZyAvIDI7IC8vIHNwYWNpbmcgYmVmb3JlIGZpcnN0IGNoYXJhY3RlclxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGogPCBvdXRwdXRUZXh0RGF0YVtpXS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0bGluZVdpZHRoICs9IHN0eS5sZXR0ZXJTcGFjaW5nIC8gMjsgLy8gc3BhY2luZyBhZnRlciBsYXN0IGNoYXJhY3RlclxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gc2F2ZSB0aGUgZm9udCBwcm9wZXJ0aWVzXG5cdFx0XHRcdG91dHB1dFRleHREYXRhW2ldW2pdLmZvbnRQcm9wZXJ0aWVzID0gUElYSS5UZXh0TWV0cmljcy5tZWFzdXJlRm9udCh0aGlzLmNvbnRleHQuZm9udCk7XG5cblx0XHRcdFx0Ly8gc2F2ZSB0aGUgaGVpZ2h0XG5cdFx0XHRcdG91dHB1dFRleHREYXRhW2ldW2pdLmhlaWdodCA9XG5cdFx0XHRcdFx0XHRvdXRwdXRUZXh0RGF0YVtpXVtqXS5mb250UHJvcGVydGllcy5mb250U2l6ZSArIG91dHB1dFRleHREYXRhW2ldW2pdLnN0eWxlLnN0cm9rZVRoaWNrbmVzcztcblx0XHRcdFx0bGluZUhlaWdodCA9IE1hdGgubWF4KGxpbmVIZWlnaHQsIG91dHB1dFRleHREYXRhW2ldW2pdLmhlaWdodCk7XG5cdFx0XHR9XG5cblx0XHRcdGxpbmVXaWR0aHNbaV0gPSBsaW5lV2lkdGg7XG5cdFx0XHRsaW5lSGVpZ2h0c1tpXSA9IGxpbmVIZWlnaHQ7XG5cdFx0XHRtYXhMaW5lV2lkdGggPSBNYXRoLm1heChtYXhMaW5lV2lkdGgsIGxpbmVXaWR0aCk7XG5cdFx0fVxuXG5cdFx0Ly8gdHJhbnNmb3JtIHN0eWxlcyBpbiBhcnJheVxuXHRcdGxldCBzdHlsZXNBcnJheSA9IE9iamVjdC5rZXlzKHRleHRTdHlsZXMpLm1hcCgoa2V5KSA9PiB0ZXh0U3R5bGVzW2tleV0pO1xuXG5cdFx0bGV0IG1heFN0cm9rZVRoaWNrbmVzcyA9IHN0eWxlc0FycmF5LnJlZHVjZSgocHJldiwgY3VycikgPT4gTWF0aC5tYXgocHJldiwgY3Vyci5zdHJva2VUaGlja25lc3MgfHwgMCksIDApO1xuXG5cdFx0bGV0IGRyb3BTaGFkb3dQYWRkaW5nID0gdGhpcy5nZXREcm9wU2hhZG93UGFkZGluZygpO1xuXG5cdFx0bGV0IG1heExpbmVIZWlnaHQgPSBsaW5lSGVpZ2h0cy5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IE1hdGgubWF4KHByZXYsIGN1cnIpLCAwKTtcblxuXHRcdC8vIGRlZmluZSB0aGUgcmlnaHQgd2lkdGggYW5kIGhlaWdodFxuXHRcdGxldCB3aWR0aCA9IG1heExpbmVXaWR0aCArIG1heFN0cm9rZVRoaWNrbmVzcyArIDIgKiBkcm9wU2hhZG93UGFkZGluZztcblx0XHRsZXQgaGVpZ2h0ID0gKG1heExpbmVIZWlnaHQgKiBsaW5lcy5sZW5ndGgpICsgMiAqIGRyb3BTaGFkb3dQYWRkaW5nO1xuXG5cdFx0dGhpcy5jYW52YXMud2lkdGggPSAod2lkdGggKyB0aGlzLmNvbnRleHQubGluZVdpZHRoKSAqIHRoaXMucmVzb2x1dGlvbjtcblx0XHR0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiB0aGlzLnJlc29sdXRpb247XG5cblx0XHR0aGlzLmNvbnRleHQuc2NhbGUodGhpcy5yZXNvbHV0aW9uLCB0aGlzLnJlc29sdXRpb24pO1xuXG5cdFx0dGhpcy5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwiYWxwaGFiZXRpY1wiO1xuXHRcdHRoaXMuY29udGV4dC5saW5lSm9pbiA9IFwicm91bmRcIjtcblxuXHRcdGxldCBiYXNlUG9zaXRpb25ZID0gZHJvcFNoYWRvd1BhZGRpbmc7XG5cblx0XHRsZXQgZHJhd2luZ0RhdGE6IFRleHREcmF3aW5nRGF0YVtdID0gW107XG5cblx0XHQvLyBDb21wdXRlIHRoZSBkcmF3aW5nIGRhdGFcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dFRleHREYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgbGluZSA9IG91dHB1dFRleHREYXRhW2ldO1xuXHRcdFx0bGV0IGxpbmVQb3NpdGlvblg6IG51bWJlcjtcblxuXHRcdFx0c3dpdGNoICh0aGlzLl9zdHlsZS5hbGlnbikge1xuXHRcdFx0XHRjYXNlIFwibGVmdFwiOlxuXHRcdFx0XHRcdGxpbmVQb3NpdGlvblggPSBkcm9wU2hhZG93UGFkZGluZztcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiY2VudGVyXCI6XG5cdFx0XHRcdFx0bGluZVBvc2l0aW9uWCA9IGRyb3BTaGFkb3dQYWRkaW5nICsgKG1heExpbmVXaWR0aCAtIGxpbmVXaWR0aHNbaV0pIC8gMjtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwicmlnaHRcIjpcblx0XHRcdFx0XHRsaW5lUG9zaXRpb25YID0gZHJvcFNoYWRvd1BhZGRpbmcgKyBtYXhMaW5lV2lkdGggLSBsaW5lV2lkdGhzW2ldO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGxpbmUubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0bGV0IHsgc3R5bGUsIHRleHQsIGZvbnRQcm9wZXJ0aWVzIH0gPSBsaW5lW2pdO1xuXG5cdFx0XHRcdGxpbmVQb3NpdGlvblggKz0gbWF4U3Ryb2tlVGhpY2tuZXNzIC8gMjtcblxuXHRcdFx0XHRsZXQgbGluZVBvc2l0aW9uWSA9IG1heFN0cm9rZVRoaWNrbmVzcyAvIDIgKyBiYXNlUG9zaXRpb25ZICsgZm9udFByb3BlcnRpZXMuYXNjZW50O1xuXG5cdFx0XHRcdGlmIChzdHlsZS52YWxpZ24gPT09IFwiYm90dG9tXCIpIHtcblx0XHRcdFx0XHRsaW5lUG9zaXRpb25ZICs9IGxpbmVIZWlnaHRzW2ldIC0gbGluZVtqXS5oZWlnaHQgLSAobWF4U3Ryb2tlVGhpY2tuZXNzIC0gc3R5bGUuc3Ryb2tlVGhpY2tuZXNzKSAvIDI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc3R5bGUudmFsaWduID09PSBcIm1pZGRsZVwiKSB7XG5cdFx0XHRcdFx0bGluZVBvc2l0aW9uWSArPSAobGluZUhlaWdodHNbaV0gLSBsaW5lW2pdLmhlaWdodCkgLyAyIC0gKG1heFN0cm9rZVRoaWNrbmVzcyAtIHN0eWxlLnN0cm9rZVRoaWNrbmVzcykgLyAyO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHN0eWxlLmxldHRlclNwYWNpbmcgPT09IDApIHtcblx0XHRcdFx0XHRkcmF3aW5nRGF0YS5wdXNoKHtcblx0XHRcdFx0XHRcdHRleHQsXG5cdFx0XHRcdFx0XHRzdHlsZSxcblx0XHRcdFx0XHRcdHg6IGxpbmVQb3NpdGlvblgsXG5cdFx0XHRcdFx0XHR5OiBsaW5lUG9zaXRpb25ZXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRsaW5lUG9zaXRpb25YICs9IGxpbmVbal0ud2lkdGg7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5jb250ZXh0LmZvbnQgPSB0aGlzLmdldEZvbnRTdHJpbmcobGluZVtqXS5zdHlsZSk7XG5cblx0XHRcdFx0XHRmb3IgKGxldCBrID0gMDsgayA8IHRleHQubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0XHRcdGlmIChrID4gMCB8fCBqID4gMCkge1xuXHRcdFx0XHRcdFx0XHRsaW5lUG9zaXRpb25YICs9IHN0eWxlLmxldHRlclNwYWNpbmcgLyAyO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRkcmF3aW5nRGF0YS5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogdGV4dC5jaGFyQXQoayksXG5cdFx0XHRcdFx0XHRcdHN0eWxlLFxuXHRcdFx0XHRcdFx0XHR4OiBsaW5lUG9zaXRpb25YLFxuXHRcdFx0XHRcdFx0XHR5OiBsaW5lUG9zaXRpb25ZXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0bGluZVBvc2l0aW9uWCArPSB0aGlzLmNvbnRleHQubWVhc3VyZVRleHQodGV4dC5jaGFyQXQoaykpLndpZHRoO1xuXG5cdFx0XHRcdFx0XHRpZiAoayA8IHRleHQubGVuZ3RoIC0gMSB8fCBqIDwgbGluZS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0XHRcdGxpbmVQb3NpdGlvblggKz0gc3R5bGUubGV0dGVyU3BhY2luZyAvIDI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGluZVBvc2l0aW9uWCAtPSBtYXhTdHJva2VUaGlja25lc3MgLyAyO1xuXHRcdFx0fVxuXG5cdFx0XHRiYXNlUG9zaXRpb25ZICs9IGxpbmVIZWlnaHRzW2ldO1xuXHRcdH1cblxuXHRcdHRoaXMuY29udGV4dC5zYXZlKCk7XG5cblx0XHQvLyBGaXJzdCBwYXNzOiBkcmF3IHRoZSBzaGFkb3dzIG9ubHlcblx0XHRkcmF3aW5nRGF0YS5mb3JFYWNoKCh7IHN0eWxlLCB0ZXh0LCB4LCB5IH0pID0+IHtcblx0XHRcdGlmICghc3R5bGUuZHJvcFNoYWRvdykge1xuXHRcdFx0XHRyZXR1cm47IC8vIFRoaXMgdGV4dCBkb2Vzbid0IGhhdmUgYSBzaGFkb3dcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5jb250ZXh0LmZvbnQgPSB0aGlzLmdldEZvbnRTdHJpbmcoc3R5bGUpO1xuXG5cdFx0XHRsZXQgZHJvcEZpbGxTdHlsZSA9IHN0eWxlLmRyb3BTaGFkb3dDb2xvcjtcblx0XHRcdGlmICh0eXBlb2YgZHJvcEZpbGxTdHlsZSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0XHRkcm9wRmlsbFN0eWxlID0gUElYSS51dGlscy5oZXgyc3RyaW5nKGRyb3BGaWxsU3R5bGUpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5jb250ZXh0LnNoYWRvd0NvbG9yID0gZHJvcEZpbGxTdHlsZTtcblx0XHRcdHRoaXMuY29udGV4dC5zaGFkb3dCbHVyID0gc3R5bGUuZHJvcFNoYWRvd0JsdXI7XG5cdFx0XHR0aGlzLmNvbnRleHQuc2hhZG93T2Zmc2V0WCA9IE1hdGguY29zKHN0eWxlLmRyb3BTaGFkb3dBbmdsZSkgKiBzdHlsZS5kcm9wU2hhZG93RGlzdGFuY2UgKiB0aGlzLnJlc29sdXRpb247XG5cdFx0XHR0aGlzLmNvbnRleHQuc2hhZG93T2Zmc2V0WSA9IE1hdGguc2luKHN0eWxlLmRyb3BTaGFkb3dBbmdsZSkgKiBzdHlsZS5kcm9wU2hhZG93RGlzdGFuY2UgKiB0aGlzLnJlc29sdXRpb247XG5cblx0XHRcdHRoaXMuY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4LCB5KTtcblx0XHR9KTtcblxuXHRcdHRoaXMuY29udGV4dC5yZXN0b3JlKCk7XG5cblx0XHQvLyBTZWNvbmQgcGFzczogZHJhdyBzdHJva2VzIGFuZCBmaWxsc1xuXHRcdGRyYXdpbmdEYXRhLmZvckVhY2goKHsgc3R5bGUsIHRleHQsIHgsIHkgfSkgPT4ge1xuXHRcdFx0dGhpcy5jb250ZXh0LmZvbnQgPSB0aGlzLmdldEZvbnRTdHJpbmcoc3R5bGUpO1xuXG5cdFx0XHRsZXQgc3Ryb2tlU3R5bGUgPSBzdHlsZS5zdHJva2U7XG5cdFx0XHRpZiAodHlwZW9mIHN0cm9rZVN0eWxlID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHRcdHN0cm9rZVN0eWxlID0gUElYSS51dGlscy5oZXgyc3RyaW5nKHN0cm9rZVN0eWxlKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5jb250ZXh0LnN0cm9rZVN0eWxlID0gc3Ryb2tlU3R5bGU7XG5cdFx0XHR0aGlzLmNvbnRleHQubGluZVdpZHRoID0gc3R5bGUuc3Ryb2tlVGhpY2tuZXNzO1xuXG5cdFx0XHQvLyBzZXQgY2FudmFzIHRleHQgc3R5bGVzXG5cdFx0XHRsZXQgZmlsbFN0eWxlID0gc3R5bGUuZmlsbDtcblx0XHRcdGlmICh0eXBlb2YgZmlsbFN0eWxlID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHRcdGZpbGxTdHlsZSA9IFBJWEkudXRpbHMuaGV4MnN0cmluZyhmaWxsU3R5bGUpO1xuXHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZpbGxTdHlsZSkpIHtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBmaWxsU3R5bGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRsZXQgZmlsbCA9IGZpbGxTdHlsZVtpXTtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGZpbGwgPT09IFwibnVtYmVyXCIpIHtcblx0XHRcdFx0XHRcdGZpbGxTdHlsZVtpXSA9IFBJWEkudXRpbHMuaGV4MnN0cmluZyhmaWxsKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLl9nZW5lcmF0ZUZpbGxTdHlsZShuZXcgUElYSS5UZXh0U3R5bGUoc3R5bGUpLCBbdGV4dF0pIGFzIHN0cmluZyB8IENhbnZhc0dyYWRpZW50O1xuXHRcdFx0Ly8gVHlwZWNhc3QgcmVxdWlyZWQgZm9yIHByb3BlciB0eXBlY2hlY2tpbmdcblxuXHRcdFx0aWYgKHN0eWxlLnN0cm9rZSAmJiBzdHlsZS5zdHJva2VUaGlja25lc3MpIHtcblx0XHRcdFx0dGhpcy5jb250ZXh0LnN0cm9rZVRleHQodGV4dCwgeCwgeSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzdHlsZS5maWxsKSB7XG5cdFx0XHRcdHRoaXMuY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4LCB5KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMudXBkYXRlVGV4dHVyZSgpO1xuXHR9XG5cblx0cHJvdGVjdGVkIHdvcmRXcmFwKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0Ly8gR3JlZWR5IHdyYXBwaW5nIGFsZ29yaXRobSB0aGF0IHdpbGwgd3JhcCB3b3JkcyBhcyB0aGUgbGluZSBncm93cyBsb25nZXIgdGhhbiBpdHMgaG9yaXpvbnRhbCBib3VuZHMuXG5cdFx0bGV0IHJlc3VsdCA9ICcnO1xuXHRcdGxldCB0YWdzID0gT2JqZWN0LmtleXModGhpcy50ZXh0U3R5bGVzKS5qb2luKFwifFwiKTtcblx0XHRsZXQgcmUgPSBuZXcgUmVnRXhwKGAoPFxcLz8oJHt0YWdzfSk+KWAsIFwiZ1wiKTtcblxuXHRcdGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdChcIlxcblwiKTtcblx0XHRjb25zdCB3b3JkV3JhcFdpZHRoID0gdGhpcy5fc3R5bGUud29yZFdyYXBXaWR0aDtcblx0XHRsZXQgc3R5bGVTdGFjayA9IFt0aGlzLmFzc2lnbih7fSwgdGhpcy50ZXh0U3R5bGVzW1wiZGVmYXVsdFwiXSldO1xuXHRcdHRoaXMuY29udGV4dC5mb250ID0gdGhpcy5nZXRGb250U3RyaW5nKHRoaXMudGV4dFN0eWxlc1tcImRlZmF1bHRcIl0pO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IHNwYWNlTGVmdCA9IHdvcmRXcmFwV2lkdGg7XG5cdFx0XHRjb25zdCB3b3JkcyA9IGxpbmVzW2ldLnNwbGl0KFwiIFwiKTtcblxuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB3b3Jkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRjb25zdCBwYXJ0cyA9IHdvcmRzW2pdLnNwbGl0KHJlKTtcblxuXHRcdFx0XHRmb3IgKGxldCBrID0gMDsgayA8IHBhcnRzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdFx0aWYgKHJlLnRlc3QocGFydHNba10pKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gcGFydHNba107XG5cdFx0XHRcdFx0XHRpZiAocGFydHNba11bMV0gPT09IFwiL1wiKSB7XG5cdFx0XHRcdFx0XHRcdGsrKztcblx0XHRcdFx0XHRcdFx0c3R5bGVTdGFjay5wb3AoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGsrKztcblx0XHRcdFx0XHRcdFx0c3R5bGVTdGFjay5wdXNoKHRoaXMuYXNzaWduKHt9LCBzdHlsZVN0YWNrW3N0eWxlU3RhY2subGVuZ3RoIC0gMV0sIHRoaXMudGV4dFN0eWxlc1twYXJ0c1trXV0pKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRoaXMuY29udGV4dC5mb250ID0gdGhpcy5nZXRGb250U3RyaW5nKHN0eWxlU3RhY2tbc3R5bGVTdGFjay5sZW5ndGggLSAxXSk7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBwYXJ0V2lkdGggPSB0aGlzLmNvbnRleHQubWVhc3VyZVRleHQocGFydHNba10pLndpZHRoO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuX3N0eWxlLmJyZWFrV29yZHMgJiYgcGFydFdpZHRoID4gd29yZFdyYXBXaWR0aCkge1xuXHRcdFx0XHRcdFx0Ly8gUGFydCBzaG91bGQgYmUgc3BsaXQgaW4gdGhlIG1pZGRsZVxuXHRcdFx0XHRcdFx0Y29uc3QgY2hhcmFjdGVycyA9IHBhcnRzW2tdLnNwbGl0KCcnKTtcblxuXHRcdFx0XHRcdFx0aWYgKGogPiAwICYmIGsgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ICs9IFwiIFwiO1xuXHRcdFx0XHRcdFx0XHRzcGFjZUxlZnQgLT0gdGhpcy5jb250ZXh0Lm1lYXN1cmVUZXh0KFwiIFwiKS53aWR0aDtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Zm9yIChsZXQgYyA9IDA7IGMgPCBjaGFyYWN0ZXJzLmxlbmd0aDsgYysrKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGNoYXJhY3RlcldpZHRoID0gdGhpcy5jb250ZXh0Lm1lYXN1cmVUZXh0KGNoYXJhY3RlcnNbY10pLndpZHRoO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChjaGFyYWN0ZXJXaWR0aCA+IHNwYWNlTGVmdCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdCArPSBgXFxuJHtjaGFyYWN0ZXJzW2NdfWA7XG5cdFx0XHRcdFx0XHRcdFx0c3BhY2VMZWZ0ID0gd29yZFdyYXBXaWR0aCAtIGNoYXJhY3RlcldpZHRoO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChqID4gMCAmJiBrID09PSAwICYmIGMgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCArPSBcIiBcIjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgKz0gY2hhcmFjdGVyc1tjXTtcblx0XHRcdFx0XHRcdFx0XHRzcGFjZUxlZnQgLT0gY2hhcmFjdGVyV2lkdGg7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgcGFkZGVkUGFydFdpZHRoID1cblx0XHRcdFx0XHRcdFx0cGFydFdpZHRoICsgKGsgPT09IDAgPyB0aGlzLmNvbnRleHQubWVhc3VyZVRleHQoXCIgXCIpLndpZHRoIDogMCk7XG5cblx0XHRcdFx0XHRcdGlmIChqID09PSAwIHx8IHBhZGRlZFBhcnRXaWR0aCA+IHNwYWNlTGVmdCkge1xuXHRcdFx0XHRcdFx0XHQvLyBTa2lwIHByaW50aW5nIHRoZSBuZXdsaW5lIGlmIGl0J3MgdGhlIGZpcnN0IHdvcmQgb2YgdGhlIGxpbmUgdGhhdCBpc1xuXHRcdFx0XHRcdFx0XHQvLyBncmVhdGVyIHRoYW4gdGhlIHdvcmQgd3JhcCB3aWR0aC5cblx0XHRcdFx0XHRcdFx0aWYgKGogPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0ICs9IFwiXFxuXCI7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmVzdWx0ICs9IHBhcnRzW2tdO1xuXHRcdFx0XHRcdFx0XHRzcGFjZUxlZnQgPSB3b3JkV3JhcFdpZHRoIC0gcGFydFdpZHRoO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c3BhY2VMZWZ0IC09IHBhZGRlZFBhcnRXaWR0aDtcblxuXHRcdFx0XHRcdFx0XHRpZiAoayA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdCArPSBcIiBcIjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCArPSBwYXJ0c1trXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGkgPCBsaW5lcy5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdHJlc3VsdCArPSAnXFxuJztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0cHJvdGVjdGVkIHVwZGF0ZVRleHR1cmUoKSB7XG5cdFx0Y29uc3QgdGV4dHVyZSA9IHRoaXMuX3RleHR1cmU7XG5cblx0XHRsZXQgZHJvcFNoYWRvd1BhZGRpbmcgPSB0aGlzLmdldERyb3BTaGFkb3dQYWRkaW5nKCk7XG5cblx0XHR0ZXh0dXJlLmJhc2VUZXh0dXJlLmhhc0xvYWRlZCA9IHRydWU7XG5cdFx0dGV4dHVyZS5iYXNlVGV4dHVyZS5yZXNvbHV0aW9uID0gdGhpcy5yZXNvbHV0aW9uO1xuXG5cdFx0dGV4dHVyZS5iYXNlVGV4dHVyZS5yZWFsV2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aDtcblx0XHR0ZXh0dXJlLmJhc2VUZXh0dXJlLnJlYWxIZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG5cdFx0dGV4dHVyZS5iYXNlVGV4dHVyZS53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoIC8gdGhpcy5yZXNvbHV0aW9uO1xuXHRcdHRleHR1cmUuYmFzZVRleHR1cmUuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0IC8gdGhpcy5yZXNvbHV0aW9uO1xuXHRcdHRleHR1cmUudHJpbS53aWR0aCA9IHRleHR1cmUuZnJhbWUud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMucmVzb2x1dGlvbjtcblx0XHR0ZXh0dXJlLnRyaW0uaGVpZ2h0ID0gdGV4dHVyZS5mcmFtZS5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyB0aGlzLnJlc29sdXRpb247XG5cblx0XHR0ZXh0dXJlLnRyaW0ueCA9IC10aGlzLl9zdHlsZS5wYWRkaW5nIC0gZHJvcFNoYWRvd1BhZGRpbmc7XG5cdFx0dGV4dHVyZS50cmltLnkgPSAtdGhpcy5fc3R5bGUucGFkZGluZyAtIGRyb3BTaGFkb3dQYWRkaW5nO1xuXG5cdFx0dGV4dHVyZS5vcmlnLndpZHRoID0gdGV4dHVyZS5mcmFtZS53aWR0aCAtICh0aGlzLl9zdHlsZS5wYWRkaW5nICsgZHJvcFNoYWRvd1BhZGRpbmcpICogMjtcblx0XHR0ZXh0dXJlLm9yaWcuaGVpZ2h0ID0gdGV4dHVyZS5mcmFtZS5oZWlnaHQgLSAodGhpcy5fc3R5bGUucGFkZGluZyArIGRyb3BTaGFkb3dQYWRkaW5nKSAqIDI7XG5cblx0XHQvLyBjYWxsIHNwcml0ZSBvblRleHR1cmVVcGRhdGUgdG8gdXBkYXRlIHNjYWxlIGlmIF93aWR0aCBvciBfaGVpZ2h0IHdlcmUgc2V0XG5cdFx0dGhpcy5fb25UZXh0dXJlVXBkYXRlKCk7XG5cblx0XHR0ZXh0dXJlLmJhc2VUZXh0dXJlLmVtaXQoJ3VwZGF0ZScsIHRleHR1cmUuYmFzZVRleHR1cmUpO1xuXG5cdFx0dGhpcy5kaXJ0eSA9IGZhbHNlO1xuXHR9XG5cblx0Ly8gTGF6eSBmaWxsIGZvciBPYmplY3QuYXNzaWduXG5cdHByaXZhdGUgYXNzaWduKGRlc3RpbmF0aW9uOiBhbnksIC4uLnNvdXJjZXM6IGFueVtdKTogYW55IHtcblx0XHRmb3IgKGxldCBzb3VyY2Ugb2Ygc291cmNlcykge1xuXHRcdFx0Zm9yIChsZXQga2V5IGluIHNvdXJjZSkge1xuXHRcdFx0XHRkZXN0aW5hdGlvbltrZXldID0gc291cmNlW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRlc3RpbmF0aW9uO1xuXHR9XG59XG4iXX0=
