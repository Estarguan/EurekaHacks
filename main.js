var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => DidYouEvenListenPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/recorder-view.ts
var import_obsidian = require("obsidian");
var import_view4 = require("@codemirror/view");
var import_state4 = require("@codemirror/state");
var import_commands = require("@codemirror/commands");
var import_language5 = require("@codemirror/language");

// node_modules/@codemirror/lang-markdown/dist/index.js
var import_state3 = require("@codemirror/state");
var import_view3 = require("@codemirror/view");
var import_language4 = require("@codemirror/language");
var import_autocomplete2 = require("@codemirror/autocomplete");

// node_modules/@lezer/markdown/dist/index.js
var import_common = require("@lezer/common");
var import_highlight = require("@lezer/highlight");
var CompositeBlock = class _CompositeBlock {
  static create(type, value, from, parentHash, end) {
    let hash2 = parentHash + (parentHash << 8) + type + (value << 4) | 0;
    return new _CompositeBlock(type, value, from, hash2, end, [], []);
  }
  constructor(type, value, from, hash2, end, children, positions) {
    this.type = type;
    this.value = value;
    this.from = from;
    this.hash = hash2;
    this.end = end;
    this.children = children;
    this.positions = positions;
    this.hashProp = [[import_common.NodeProp.contextHash, hash2]];
  }
  addChild(child, pos) {
    if (child.prop(import_common.NodeProp.contextHash) != this.hash)
      child = new import_common.Tree(child.type, child.children, child.positions, child.length, this.hashProp);
    this.children.push(child);
    this.positions.push(pos);
  }
  toTree(nodeSet, end = this.end) {
    let last = this.children.length - 1;
    if (last >= 0)
      end = Math.max(end, this.positions[last] + this.children[last].length + this.from);
    return new import_common.Tree(nodeSet.types[this.type], this.children, this.positions, end - this.from).balance({
      makeTree: (children, positions, length) => new import_common.Tree(import_common.NodeType.none, children, positions, length, this.hashProp)
    });
  }
};
var Type;
(function(Type2) {
  Type2[Type2["Document"] = 1] = "Document";
  Type2[Type2["CodeBlock"] = 2] = "CodeBlock";
  Type2[Type2["FencedCode"] = 3] = "FencedCode";
  Type2[Type2["Blockquote"] = 4] = "Blockquote";
  Type2[Type2["HorizontalRule"] = 5] = "HorizontalRule";
  Type2[Type2["BulletList"] = 6] = "BulletList";
  Type2[Type2["OrderedList"] = 7] = "OrderedList";
  Type2[Type2["ListItem"] = 8] = "ListItem";
  Type2[Type2["ATXHeading1"] = 9] = "ATXHeading1";
  Type2[Type2["ATXHeading2"] = 10] = "ATXHeading2";
  Type2[Type2["ATXHeading3"] = 11] = "ATXHeading3";
  Type2[Type2["ATXHeading4"] = 12] = "ATXHeading4";
  Type2[Type2["ATXHeading5"] = 13] = "ATXHeading5";
  Type2[Type2["ATXHeading6"] = 14] = "ATXHeading6";
  Type2[Type2["SetextHeading1"] = 15] = "SetextHeading1";
  Type2[Type2["SetextHeading2"] = 16] = "SetextHeading2";
  Type2[Type2["HTMLBlock"] = 17] = "HTMLBlock";
  Type2[Type2["LinkReference"] = 18] = "LinkReference";
  Type2[Type2["Paragraph"] = 19] = "Paragraph";
  Type2[Type2["CommentBlock"] = 20] = "CommentBlock";
  Type2[Type2["ProcessingInstructionBlock"] = 21] = "ProcessingInstructionBlock";
  Type2[Type2["Escape"] = 22] = "Escape";
  Type2[Type2["Entity"] = 23] = "Entity";
  Type2[Type2["HardBreak"] = 24] = "HardBreak";
  Type2[Type2["Emphasis"] = 25] = "Emphasis";
  Type2[Type2["StrongEmphasis"] = 26] = "StrongEmphasis";
  Type2[Type2["Link"] = 27] = "Link";
  Type2[Type2["Image"] = 28] = "Image";
  Type2[Type2["InlineCode"] = 29] = "InlineCode";
  Type2[Type2["HTMLTag"] = 30] = "HTMLTag";
  Type2[Type2["Comment"] = 31] = "Comment";
  Type2[Type2["ProcessingInstruction"] = 32] = "ProcessingInstruction";
  Type2[Type2["Autolink"] = 33] = "Autolink";
  Type2[Type2["HeaderMark"] = 34] = "HeaderMark";
  Type2[Type2["QuoteMark"] = 35] = "QuoteMark";
  Type2[Type2["ListMark"] = 36] = "ListMark";
  Type2[Type2["LinkMark"] = 37] = "LinkMark";
  Type2[Type2["EmphasisMark"] = 38] = "EmphasisMark";
  Type2[Type2["CodeMark"] = 39] = "CodeMark";
  Type2[Type2["CodeText"] = 40] = "CodeText";
  Type2[Type2["CodeInfo"] = 41] = "CodeInfo";
  Type2[Type2["LinkTitle"] = 42] = "LinkTitle";
  Type2[Type2["LinkLabel"] = 43] = "LinkLabel";
  Type2[Type2["URL"] = 44] = "URL";
})(Type || (Type = {}));
var LeafBlock = class {
  /**
  @internal
  */
  constructor(start, content) {
    this.start = start;
    this.content = content;
    this.marks = [];
    this.parsers = [];
  }
};
var Line = class {
  constructor() {
    this.text = "";
    this.baseIndent = 0;
    this.basePos = 0;
    this.depth = 0;
    this.markers = [];
    this.pos = 0;
    this.indent = 0;
    this.next = -1;
  }
  /**
  @internal
  */
  forward() {
    if (this.basePos > this.pos)
      this.forwardInner();
  }
  /**
  @internal
  */
  forwardInner() {
    let newPos = this.skipSpace(this.basePos);
    this.indent = this.countIndent(newPos, this.pos, this.indent);
    this.pos = newPos;
    this.next = newPos == this.text.length ? -1 : this.text.charCodeAt(newPos);
  }
  /**
  Skip whitespace after the given position, return the position of
  the next non-space character or the end of the line if there's
  only space after `from`.
  */
  skipSpace(from) {
    return skipSpace(this.text, from);
  }
  /**
  @internal
  */
  reset(text) {
    this.text = text;
    this.baseIndent = this.basePos = this.pos = this.indent = 0;
    this.forwardInner();
    this.depth = 1;
    while (this.markers.length)
      this.markers.pop();
  }
  /**
  Move the line's base position forward to the given position.
  This should only be called by composite [block
  parsers](#BlockParser.parse) or [markup skipping
  functions](#NodeSpec.composite).
  */
  moveBase(to) {
    this.basePos = to;
    this.baseIndent = this.countIndent(to, this.pos, this.indent);
  }
  /**
  Move the line's base position forward to the given _column_.
  */
  moveBaseColumn(indent) {
    this.baseIndent = indent;
    this.basePos = this.findColumn(indent);
  }
  /**
  Store a composite-block-level marker. Should be called from
  [markup skipping functions](#NodeSpec.composite) when they
  consume any non-whitespace characters.
  */
  addMarker(elt2) {
    this.markers.push(elt2);
  }
  /**
  Find the column position at `to`, optionally starting at a given
  position and column.
  */
  countIndent(to, from = 0, indent = 0) {
    for (let i = from; i < to; i++)
      indent += this.text.charCodeAt(i) == 9 ? 4 - indent % 4 : 1;
    return indent;
  }
  /**
  Find the position corresponding to the given column.
  */
  findColumn(goal) {
    let i = 0;
    for (let indent = 0; i < this.text.length && indent < goal; i++)
      indent += this.text.charCodeAt(i) == 9 ? 4 - indent % 4 : 1;
    return i;
  }
  /**
  @internal
  */
  scrub() {
    if (!this.baseIndent)
      return this.text;
    let result = "";
    for (let i = 0; i < this.basePos; i++)
      result += " ";
    return result + this.text.slice(this.basePos);
  }
};
function skipForList(bl, cx, line) {
  if (line.pos == line.text.length || bl != cx.block && line.indent >= cx.stack[line.depth + 1].value + line.baseIndent)
    return true;
  if (line.indent >= line.baseIndent + 4)
    return false;
  let size = (bl.type == Type.OrderedList ? isOrderedList : isBulletList)(line, cx, false);
  return size > 0 && (bl.type != Type.BulletList || isHorizontalRule(line, cx, false) < 0) && line.text.charCodeAt(line.pos + size - 1) == bl.value;
}
var DefaultSkipMarkup = {
  [Type.Blockquote](bl, cx, line) {
    if (line.next != 62)
      return false;
    line.markers.push(elt(Type.QuoteMark, cx.lineStart + line.pos, cx.lineStart + line.pos + 1));
    line.moveBase(line.pos + (space(line.text.charCodeAt(line.pos + 1)) ? 2 : 1));
    bl.end = cx.lineStart + line.text.length;
    return true;
  },
  [Type.ListItem](bl, _cx, line) {
    if (line.indent < line.baseIndent + bl.value && line.next > -1)
      return false;
    line.moveBaseColumn(line.baseIndent + bl.value);
    return true;
  },
  [Type.OrderedList]: skipForList,
  [Type.BulletList]: skipForList,
  [Type.Document]() {
    return true;
  }
};
function space(ch) {
  return ch == 32 || ch == 9 || ch == 10 || ch == 13;
}
function skipSpace(line, i = 0) {
  while (i < line.length && space(line.charCodeAt(i)))
    i++;
  return i;
}
function skipSpaceBack(line, i, to) {
  while (i > to && space(line.charCodeAt(i - 1)))
    i--;
  return i;
}
function isFencedCode(line) {
  if (line.next != 96 && line.next != 126)
    return -1;
  let pos = line.pos + 1;
  while (pos < line.text.length && line.text.charCodeAt(pos) == line.next)
    pos++;
  if (pos < line.pos + 3)
    return -1;
  if (line.next == 96) {
    for (let i = pos; i < line.text.length; i++)
      if (line.text.charCodeAt(i) == 96)
        return -1;
  }
  return pos;
}
function isBlockquote(line) {
  return line.next != 62 ? -1 : line.text.charCodeAt(line.pos + 1) == 32 ? 2 : 1;
}
function isHorizontalRule(line, cx, breaking) {
  if (line.next != 42 && line.next != 45 && line.next != 95)
    return -1;
  let count2 = 1;
  for (let pos = line.pos + 1; pos < line.text.length; pos++) {
    let ch = line.text.charCodeAt(pos);
    if (ch == line.next)
      count2++;
    else if (!space(ch))
      return -1;
  }
  if (breaking && line.next == 45 && isSetextUnderline(line) > -1 && line.depth == cx.stack.length && cx.parser.leafBlockParsers.indexOf(DefaultLeafBlocks.SetextHeading) > -1)
    return -1;
  return count2 < 3 ? -1 : 1;
}
function inList(cx, type) {
  for (let i = cx.stack.length - 1; i >= 0; i--)
    if (cx.stack[i].type == type)
      return true;
  return false;
}
function isBulletList(line, cx, breaking) {
  return (line.next == 45 || line.next == 43 || line.next == 42) && (line.pos == line.text.length - 1 || space(line.text.charCodeAt(line.pos + 1))) && (!breaking || inList(cx, Type.BulletList) || line.skipSpace(line.pos + 2) < line.text.length) ? 1 : -1;
}
function isOrderedList(line, cx, breaking) {
  let pos = line.pos, next = line.next;
  for (; ; ) {
    if (next >= 48 && next <= 57)
      pos++;
    else
      break;
    if (pos == line.text.length)
      return -1;
    next = line.text.charCodeAt(pos);
  }
  if (pos == line.pos || pos > line.pos + 9 || next != 46 && next != 41 || pos < line.text.length - 1 && !space(line.text.charCodeAt(pos + 1)) || breaking && !inList(cx, Type.OrderedList) && (line.skipSpace(pos + 1) == line.text.length || pos > line.pos + 1 || line.next != 49))
    return -1;
  return pos + 1 - line.pos;
}
function isAtxHeading(line) {
  if (line.next != 35)
    return -1;
  let pos = line.pos + 1;
  while (pos < line.text.length && line.text.charCodeAt(pos) == 35)
    pos++;
  if (pos < line.text.length && line.text.charCodeAt(pos) != 32)
    return -1;
  let size = pos - line.pos;
  return size > 6 ? -1 : size;
}
function isSetextUnderline(line) {
  if (line.next != 45 && line.next != 61 || line.indent >= line.baseIndent + 4)
    return -1;
  let pos = line.pos + 1;
  while (pos < line.text.length && line.text.charCodeAt(pos) == line.next)
    pos++;
  let end = pos;
  while (pos < line.text.length && space(line.text.charCodeAt(pos)))
    pos++;
  return pos == line.text.length ? end : -1;
}
var EmptyLine = /^[ \t]*$/;
var CommentEnd = /-->/;
var ProcessingEnd = /\?>/;
var HTMLBlockStyle = [
  [/^<(?:script|pre|style)(?:\s|>|$)/i, /<\/(?:script|pre|style)>/i],
  [/^\s*<!--/, CommentEnd],
  [/^\s*<\?/, ProcessingEnd],
  [/^\s*<![A-Z]/, />/],
  [/^\s*<!\[CDATA\[/, /\]\]>/],
  [/^\s*<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i, EmptyLine],
  [/^\s*(?:<\/[a-z][\w-]*\s*>|<[a-z][\w-]*(\s+[a-z:_][\w-.]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*>)\s*$/i, EmptyLine]
];
function isHTMLBlock(line, _cx, breaking) {
  if (line.next != 60)
    return -1;
  let rest = line.text.slice(line.pos);
  for (let i = 0, e = HTMLBlockStyle.length - (breaking ? 1 : 0); i < e; i++)
    if (HTMLBlockStyle[i][0].test(rest))
      return i;
  return -1;
}
function getListIndent(line, pos) {
  let indentAfter = line.countIndent(pos, line.pos, line.indent);
  let indented = line.countIndent(line.skipSpace(pos), pos, indentAfter);
  return indented >= indentAfter + 5 ? indentAfter + 1 : indented;
}
function addCodeText(marks, from, to) {
  let last = marks.length - 1;
  if (last >= 0 && marks[last].to == from && marks[last].type == Type.CodeText)
    marks[last].to = to;
  else
    marks.push(elt(Type.CodeText, from, to));
}
var DefaultBlockParsers = {
  LinkReference: void 0,
  IndentedCode(cx, line) {
    let base = line.baseIndent + 4;
    if (line.indent < base)
      return false;
    let start = line.findColumn(base);
    let from = cx.lineStart + start, to = cx.lineStart + line.text.length;
    let marks = [], pendingMarks = [];
    addCodeText(marks, from, to);
    while (cx.nextLine() && line.depth >= cx.stack.length) {
      if (line.pos == line.text.length) {
        addCodeText(pendingMarks, cx.lineStart - 1, cx.lineStart);
        for (let m of line.markers)
          pendingMarks.push(m);
      } else if (line.indent < base) {
        break;
      } else {
        if (pendingMarks.length) {
          for (let m of pendingMarks) {
            if (m.type == Type.CodeText)
              addCodeText(marks, m.from, m.to);
            else
              marks.push(m);
          }
          pendingMarks = [];
        }
        addCodeText(marks, cx.lineStart - 1, cx.lineStart);
        for (let m of line.markers)
          marks.push(m);
        to = cx.lineStart + line.text.length;
        let codeStart = cx.lineStart + line.findColumn(line.baseIndent + 4);
        if (codeStart < to)
          addCodeText(marks, codeStart, to);
      }
    }
    if (pendingMarks.length) {
      pendingMarks = pendingMarks.filter((m) => m.type != Type.CodeText);
      if (pendingMarks.length)
        line.markers = pendingMarks.concat(line.markers);
    }
    cx.addNode(cx.buffer.writeElements(marks, -from).finish(Type.CodeBlock, to - from), from);
    return true;
  },
  FencedCode(cx, line) {
    let fenceEnd = isFencedCode(line);
    if (fenceEnd < 0)
      return false;
    let from = cx.lineStart + line.pos, ch = line.next, len = fenceEnd - line.pos;
    let infoFrom = line.skipSpace(fenceEnd), infoTo = skipSpaceBack(line.text, line.text.length, infoFrom);
    let marks = [elt(Type.CodeMark, from, from + len)];
    if (infoFrom < infoTo)
      marks.push(elt(Type.CodeInfo, cx.lineStart + infoFrom, cx.lineStart + infoTo));
    for (let first = true, empty = true, hasLine = false; cx.nextLine() && line.depth >= cx.stack.length; first = false) {
      let i = line.pos;
      if (line.indent - line.baseIndent < 4)
        while (i < line.text.length && line.text.charCodeAt(i) == ch)
          i++;
      if (i - line.pos >= len && line.skipSpace(i) == line.text.length) {
        for (let m of line.markers)
          marks.push(m);
        if (empty && hasLine)
          addCodeText(marks, cx.lineStart - 1, cx.lineStart);
        marks.push(elt(Type.CodeMark, cx.lineStart + line.pos, cx.lineStart + i));
        cx.nextLine();
        break;
      } else {
        hasLine = true;
        if (!first) {
          addCodeText(marks, cx.lineStart - 1, cx.lineStart);
          empty = false;
        }
        for (let m of line.markers)
          marks.push(m);
        let textStart = cx.lineStart + line.basePos, textEnd = cx.lineStart + line.text.length;
        if (textStart < textEnd) {
          addCodeText(marks, textStart, textEnd);
          empty = false;
        }
      }
    }
    cx.addNode(cx.buffer.writeElements(marks, -from).finish(Type.FencedCode, cx.prevLineEnd() - from), from);
    return true;
  },
  Blockquote(cx, line) {
    let size = isBlockquote(line);
    if (size < 0)
      return false;
    cx.startContext(Type.Blockquote, line.pos);
    cx.addNode(Type.QuoteMark, cx.lineStart + line.pos, cx.lineStart + line.pos + 1);
    line.moveBase(line.pos + size);
    return null;
  },
  HorizontalRule(cx, line) {
    if (isHorizontalRule(line, cx, false) < 0)
      return false;
    let from = cx.lineStart + line.pos;
    cx.nextLine();
    cx.addNode(Type.HorizontalRule, from);
    return true;
  },
  BulletList(cx, line) {
    let size = isBulletList(line, cx, false);
    if (size < 0)
      return false;
    if (cx.block.type != Type.BulletList)
      cx.startContext(Type.BulletList, line.basePos, line.next);
    let newBase = getListIndent(line, line.pos + 1);
    cx.startContext(Type.ListItem, line.basePos, newBase - line.baseIndent);
    cx.addNode(Type.ListMark, cx.lineStart + line.pos, cx.lineStart + line.pos + size);
    line.moveBaseColumn(newBase);
    return null;
  },
  OrderedList(cx, line) {
    let size = isOrderedList(line, cx, false);
    if (size < 0)
      return false;
    if (cx.block.type != Type.OrderedList)
      cx.startContext(Type.OrderedList, line.basePos, line.text.charCodeAt(line.pos + size - 1));
    let newBase = getListIndent(line, line.pos + size);
    cx.startContext(Type.ListItem, line.basePos, newBase - line.baseIndent);
    cx.addNode(Type.ListMark, cx.lineStart + line.pos, cx.lineStart + line.pos + size);
    line.moveBaseColumn(newBase);
    return null;
  },
  ATXHeading(cx, line) {
    let size = isAtxHeading(line);
    if (size < 0)
      return false;
    let off = line.pos, from = cx.lineStart + off;
    let endOfSpace = skipSpaceBack(line.text, line.text.length, off), after = endOfSpace;
    while (after > off && line.text.charCodeAt(after - 1) == line.next)
      after--;
    if (after == endOfSpace || after == off || !space(line.text.charCodeAt(after - 1)))
      after = line.text.length;
    let buf = cx.buffer.write(Type.HeaderMark, 0, size).writeElements(cx.parser.parseInline(line.text.slice(off + size + 1, after), from + size + 1), -from);
    if (after < line.text.length)
      buf.write(Type.HeaderMark, after - off, endOfSpace - off);
    let node = buf.finish(Type.ATXHeading1 - 1 + size, line.text.length - off);
    cx.nextLine();
    cx.addNode(node, from);
    return true;
  },
  HTMLBlock(cx, line) {
    let type = isHTMLBlock(line, cx, false);
    if (type < 0)
      return false;
    let from = cx.lineStart + line.pos, end = HTMLBlockStyle[type][1];
    let marks = [], trailing = end != EmptyLine;
    while (!end.test(line.text) && cx.nextLine()) {
      if (line.depth < cx.stack.length) {
        trailing = false;
        break;
      }
      for (let m of line.markers)
        marks.push(m);
    }
    if (trailing)
      cx.nextLine();
    let nodeType = end == CommentEnd ? Type.CommentBlock : end == ProcessingEnd ? Type.ProcessingInstructionBlock : Type.HTMLBlock;
    let to = cx.prevLineEnd();
    cx.addNode(cx.buffer.writeElements(marks, -from).finish(nodeType, to - from), from);
    return true;
  },
  SetextHeading: void 0
  // Specifies relative precedence for block-continue function
};
var LinkReferenceParser = class {
  constructor(leaf) {
    this.stage = 0;
    this.elts = [];
    this.pos = 0;
    this.start = leaf.start;
    this.advance(leaf.content);
  }
  nextLine(cx, line, leaf) {
    if (this.stage == -1)
      return false;
    let content = leaf.content + "\n" + line.scrub();
    let finish = this.advance(content);
    if (finish > -1 && finish < content.length)
      return this.complete(cx, leaf, finish);
    return false;
  }
  finish(cx, leaf) {
    if ((this.stage == 2 || this.stage == 3) && skipSpace(leaf.content, this.pos) == leaf.content.length)
      return this.complete(cx, leaf, leaf.content.length);
    return false;
  }
  complete(cx, leaf, len) {
    cx.addLeafElement(leaf, elt(Type.LinkReference, this.start, this.start + len, this.elts));
    return true;
  }
  nextStage(elt2) {
    if (elt2) {
      this.pos = elt2.to - this.start;
      this.elts.push(elt2);
      this.stage++;
      return true;
    }
    if (elt2 === false)
      this.stage = -1;
    return false;
  }
  advance(content) {
    for (; ; ) {
      if (this.stage == -1) {
        return -1;
      } else if (this.stage == 0) {
        if (!this.nextStage(parseLinkLabel(content, this.pos, this.start, true)))
          return -1;
        if (content.charCodeAt(this.pos) != 58)
          return this.stage = -1;
        this.elts.push(elt(Type.LinkMark, this.pos + this.start, this.pos + this.start + 1));
        this.pos++;
      } else if (this.stage == 1) {
        if (!this.nextStage(parseURL(content, skipSpace(content, this.pos), this.start)))
          return -1;
      } else if (this.stage == 2) {
        let skip = skipSpace(content, this.pos), end = 0;
        if (skip > this.pos) {
          let title = parseLinkTitle(content, skip, this.start);
          if (title) {
            let titleEnd = lineEnd(content, title.to - this.start);
            if (titleEnd > 0) {
              this.nextStage(title);
              end = titleEnd;
            }
          }
        }
        if (!end)
          end = lineEnd(content, this.pos);
        return end > 0 && end < content.length ? end : -1;
      } else {
        return lineEnd(content, this.pos);
      }
    }
  }
};
function lineEnd(text, pos) {
  for (; pos < text.length; pos++) {
    let next = text.charCodeAt(pos);
    if (next == 10)
      break;
    if (!space(next))
      return -1;
  }
  return pos;
}
var SetextHeadingParser = class {
  nextLine(cx, line, leaf) {
    let underline = line.depth < cx.stack.length ? -1 : isSetextUnderline(line);
    let next = line.next;
    if (underline < 0)
      return false;
    let underlineMark = elt(Type.HeaderMark, cx.lineStart + line.pos, cx.lineStart + underline);
    cx.nextLine();
    cx.addLeafElement(leaf, elt(next == 61 ? Type.SetextHeading1 : Type.SetextHeading2, leaf.start, cx.prevLineEnd(), [
      ...cx.parser.parseInline(leaf.content, leaf.start),
      underlineMark
    ]));
    return true;
  }
  finish() {
    return false;
  }
};
var DefaultLeafBlocks = {
  LinkReference(_, leaf) {
    return leaf.content.charCodeAt(0) == 91 ? new LinkReferenceParser(leaf) : null;
  },
  SetextHeading() {
    return new SetextHeadingParser();
  }
};
var DefaultEndLeaf = [
  (_, line) => isAtxHeading(line) >= 0,
  (_, line) => isFencedCode(line) >= 0,
  (_, line) => isBlockquote(line) >= 0,
  (p, line) => isBulletList(line, p, true) >= 0,
  (p, line) => isOrderedList(line, p, true) >= 0,
  (p, line) => isHorizontalRule(line, p, true) >= 0,
  (p, line) => isHTMLBlock(line, p, true) >= 0
];
var scanLineResult = { text: "", end: 0 };
var BlockContext = class {
  /**
  @internal
  */
  constructor(parser5, input, fragments, ranges) {
    this.parser = parser5;
    this.input = input;
    this.ranges = ranges;
    this.line = new Line();
    this.atEnd = false;
    this.reusePlaceholders = /* @__PURE__ */ new Map();
    this.stoppedAt = null;
    this.rangeI = 0;
    this.to = ranges[ranges.length - 1].to;
    this.lineStart = this.absoluteLineStart = this.absoluteLineEnd = ranges[0].from;
    this.block = CompositeBlock.create(Type.Document, 0, this.lineStart, 0, 0);
    this.stack = [this.block];
    this.fragments = fragments.length ? new FragmentCursor(fragments, input) : null;
    this.readLine();
  }
  get parsedPos() {
    return this.absoluteLineStart;
  }
  advance() {
    if (this.stoppedAt != null && this.absoluteLineStart > this.stoppedAt)
      return this.finish();
    let { line } = this;
    for (; ; ) {
      for (let markI = 0; ; ) {
        let next = line.depth < this.stack.length ? this.stack[this.stack.length - 1] : null;
        while (markI < line.markers.length && (!next || line.markers[markI].from < next.end)) {
          let mark = line.markers[markI++];
          this.addNode(mark.type, mark.from, mark.to);
        }
        if (!next)
          break;
        this.finishContext();
      }
      if (line.pos < line.text.length)
        break;
      if (!this.nextLine())
        return this.finish();
    }
    if (this.fragments && this.reuseFragment(line.basePos))
      return null;
    start: for (; ; ) {
      for (let type of this.parser.blockParsers)
        if (type) {
          let result = type(this, line);
          if (result != false) {
            if (result == true)
              return null;
            line.forward();
            continue start;
          }
        }
      break;
    }
    let leaf = new LeafBlock(this.lineStart + line.pos, line.text.slice(line.pos));
    for (let parse of this.parser.leafBlockParsers)
      if (parse) {
        let parser5 = parse(this, leaf);
        if (parser5)
          leaf.parsers.push(parser5);
      }
    lines: while (this.nextLine()) {
      if (line.pos == line.text.length)
        break;
      if (line.indent < line.baseIndent + 4) {
        for (let stop of this.parser.endLeafBlock)
          if (stop(this, line, leaf))
            break lines;
      }
      for (let parser5 of leaf.parsers)
        if (parser5.nextLine(this, line, leaf))
          return null;
      leaf.content += "\n" + line.scrub();
      for (let m of line.markers)
        leaf.marks.push(m);
    }
    this.finishLeaf(leaf);
    return null;
  }
  stopAt(pos) {
    if (this.stoppedAt != null && this.stoppedAt < pos)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = pos;
  }
  reuseFragment(start) {
    if (!this.fragments.moveTo(this.absoluteLineStart + start, this.absoluteLineStart) || !this.fragments.matches(this.block.hash))
      return false;
    let taken = this.fragments.takeNodes(this);
    if (!taken)
      return false;
    this.absoluteLineStart += taken;
    this.lineStart = toRelative(this.absoluteLineStart, this.ranges);
    this.moveRangeI();
    if (this.absoluteLineStart < this.to) {
      this.lineStart++;
      this.absoluteLineStart++;
      this.readLine();
    } else {
      this.atEnd = true;
      this.readLine();
    }
    return true;
  }
  /**
  The number of parent blocks surrounding the current block.
  */
  get depth() {
    return this.stack.length;
  }
  /**
  Get the type of the parent block at the given depth. When no
  depth is passed, return the type of the innermost parent.
  */
  parentType(depth = this.depth - 1) {
    return this.parser.nodeSet.types[this.stack[depth].type];
  }
  /**
  Move to the next input line. This should only be called by
  (non-composite) [block parsers](#BlockParser.parse) that consume
  the line directly, or leaf block parser
  [`nextLine`](#LeafBlockParser.nextLine) methods when they
  consume the current line (and return true).
  */
  nextLine() {
    this.lineStart += this.line.text.length;
    if (this.absoluteLineEnd >= this.to) {
      this.absoluteLineStart = this.absoluteLineEnd;
      this.atEnd = true;
      this.readLine();
      return false;
    } else {
      this.lineStart++;
      this.absoluteLineStart = this.absoluteLineEnd + 1;
      this.moveRangeI();
      this.readLine();
      return true;
    }
  }
  /**
  Retrieve the text of the line after the current one, without
  actually moving the context's current line forward.
  */
  peekLine() {
    return this.scanLine(this.absoluteLineEnd + 1).text;
  }
  moveRangeI() {
    while (this.rangeI < this.ranges.length - 1 && this.absoluteLineStart >= this.ranges[this.rangeI].to) {
      this.rangeI++;
      this.absoluteLineStart = Math.max(this.absoluteLineStart, this.ranges[this.rangeI].from);
    }
  }
  /**
  @internal
  Collect the text for the next line.
  */
  scanLine(start) {
    let r = scanLineResult;
    r.end = start;
    if (start >= this.to) {
      r.text = "";
    } else {
      r.text = this.lineChunkAt(start);
      r.end += r.text.length;
      if (this.ranges.length > 1) {
        let textOffset = this.absoluteLineStart, rangeI = this.rangeI;
        while (this.ranges[rangeI].to < r.end) {
          rangeI++;
          let nextFrom = this.ranges[rangeI].from;
          let after = this.lineChunkAt(nextFrom);
          r.end = nextFrom + after.length;
          r.text = r.text.slice(0, this.ranges[rangeI - 1].to - textOffset) + after;
          textOffset = r.end - r.text.length;
        }
      }
    }
    return r;
  }
  /**
  @internal
  Populate this.line with the content of the next line. Skip
  leading characters covered by composite blocks.
  */
  readLine() {
    let { line } = this, { text, end } = this.scanLine(this.absoluteLineStart);
    this.absoluteLineEnd = end;
    line.reset(text);
    for (; line.depth < this.stack.length; line.depth++) {
      let cx = this.stack[line.depth], handler = this.parser.skipContextMarkup[cx.type];
      if (!handler)
        throw new Error("Unhandled block context " + Type[cx.type]);
      let marks = this.line.markers.length;
      if (!handler(cx, this, line)) {
        if (this.line.markers.length > marks)
          cx.end = this.line.markers[this.line.markers.length - 1].to;
        line.forward();
        break;
      }
      line.forward();
    }
  }
  lineChunkAt(pos) {
    let next = this.input.chunk(pos), text;
    if (!this.input.lineChunks) {
      let eol = next.indexOf("\n");
      text = eol < 0 ? next : next.slice(0, eol);
    } else {
      text = next == "\n" ? "" : next;
    }
    return pos + text.length > this.to ? text.slice(0, this.to - pos) : text;
  }
  /**
  The end position of the previous line.
  */
  prevLineEnd() {
    return this.atEnd ? this.lineStart : this.lineStart - 1;
  }
  /**
  @internal
  */
  startContext(type, start, value = 0) {
    this.block = CompositeBlock.create(type, value, this.lineStart + start, this.block.hash, this.lineStart + this.line.text.length);
    this.stack.push(this.block);
  }
  /**
  Start a composite block. Should only be called from [block
  parser functions](#BlockParser.parse) that return null.
  */
  startComposite(type, start, value = 0) {
    this.startContext(this.parser.getNodeType(type), start, value);
  }
  /**
  @internal
  */
  addNode(block, from, to) {
    if (typeof block == "number")
      block = new import_common.Tree(this.parser.nodeSet.types[block], none, none, (to !== null && to !== void 0 ? to : this.prevLineEnd()) - from);
    this.block.addChild(block, from - this.block.from);
  }
  /**
  Add a block element. Can be called by [block
  parsers](#BlockParser.parse).
  */
  addElement(elt2) {
    this.block.addChild(elt2.toTree(this.parser.nodeSet), elt2.from - this.block.from);
  }
  /**
  Add a block element from a [leaf parser](#LeafBlockParser). This
  makes sure any extra composite block markup (such as blockquote
  markers) inside the block are also added to the syntax tree.
  */
  addLeafElement(leaf, elt2) {
    this.addNode(this.buffer.writeElements(injectMarks(elt2.children, leaf.marks), -elt2.from).finish(elt2.type, elt2.to - elt2.from), elt2.from);
  }
  /**
  @internal
  */
  finishContext() {
    let cx = this.stack.pop();
    let top = this.stack[this.stack.length - 1];
    top.addChild(cx.toTree(this.parser.nodeSet), cx.from - top.from);
    this.block = top;
  }
  finish() {
    while (this.stack.length > 1)
      this.finishContext();
    return this.addGaps(this.block.toTree(this.parser.nodeSet, this.lineStart));
  }
  addGaps(tree) {
    return this.ranges.length > 1 ? injectGaps(this.ranges, 0, tree.topNode, this.ranges[0].from, this.reusePlaceholders) : tree;
  }
  /**
  @internal
  */
  finishLeaf(leaf) {
    for (let parser5 of leaf.parsers)
      if (parser5.finish(this, leaf))
        return;
    let inline = injectMarks(this.parser.parseInline(leaf.content, leaf.start), leaf.marks);
    this.addNode(this.buffer.writeElements(inline, -leaf.start).finish(Type.Paragraph, leaf.content.length), leaf.start);
  }
  elt(type, from, to, children) {
    if (typeof type == "string")
      return elt(this.parser.getNodeType(type), from, to, children);
    return new TreeElement(type, from);
  }
  /**
  @internal
  */
  get buffer() {
    return new Buffer2(this.parser.nodeSet);
  }
};
function injectGaps(ranges, rangeI, tree, offset, dummies) {
  let rangeEnd = ranges[rangeI].to;
  let children = [], positions = [], start = tree.from + offset;
  function movePastNext(upto, inclusive) {
    while (inclusive ? upto >= rangeEnd : upto > rangeEnd) {
      let size = ranges[rangeI + 1].from - rangeEnd;
      offset += size;
      upto += size;
      rangeI++;
      rangeEnd = ranges[rangeI].to;
    }
  }
  for (let ch = tree.firstChild; ch; ch = ch.nextSibling) {
    movePastNext(ch.from + offset, true);
    let from = ch.from + offset, node, reuse = dummies.get(ch.tree);
    if (reuse) {
      node = reuse;
    } else if (ch.to + offset > rangeEnd) {
      node = injectGaps(ranges, rangeI, ch, offset, dummies);
      movePastNext(ch.to + offset, false);
    } else {
      node = ch.toTree();
    }
    children.push(node);
    positions.push(from - start);
  }
  movePastNext(tree.to + offset, false);
  return new import_common.Tree(tree.type, children, positions, tree.to + offset - start, tree.tree ? tree.tree.propValues : void 0);
}
var MarkdownParser = class _MarkdownParser extends import_common.Parser {
  /**
  @internal
  */
  constructor(nodeSet, blockParsers, leafBlockParsers, blockNames, endLeafBlock, skipContextMarkup, inlineParsers, inlineNames, wrappers) {
    super();
    this.nodeSet = nodeSet;
    this.blockParsers = blockParsers;
    this.leafBlockParsers = leafBlockParsers;
    this.blockNames = blockNames;
    this.endLeafBlock = endLeafBlock;
    this.skipContextMarkup = skipContextMarkup;
    this.inlineParsers = inlineParsers;
    this.inlineNames = inlineNames;
    this.wrappers = wrappers;
    this.nodeTypes = /* @__PURE__ */ Object.create(null);
    for (let t of nodeSet.types)
      this.nodeTypes[t.name] = t.id;
  }
  createParse(input, fragments, ranges) {
    let parse = new BlockContext(this, input, fragments, ranges);
    for (let w of this.wrappers)
      parse = w(parse, input, fragments, ranges);
    return parse;
  }
  /**
  Reconfigure the parser.
  */
  configure(spec) {
    let config = resolveConfig(spec);
    if (!config)
      return this;
    let { nodeSet, skipContextMarkup } = this;
    let blockParsers = this.blockParsers.slice(), leafBlockParsers = this.leafBlockParsers.slice(), blockNames = this.blockNames.slice(), inlineParsers = this.inlineParsers.slice(), inlineNames = this.inlineNames.slice(), endLeafBlock = this.endLeafBlock.slice(), wrappers = this.wrappers;
    if (nonEmpty(config.defineNodes)) {
      skipContextMarkup = Object.assign({}, skipContextMarkup);
      let nodeTypes2 = nodeSet.types.slice(), styles;
      for (let s of config.defineNodes) {
        let { name, block, composite, style } = typeof s == "string" ? { name: s } : s;
        if (nodeTypes2.some((t) => t.name == name))
          continue;
        if (composite)
          skipContextMarkup[nodeTypes2.length] = (bl, cx, line) => composite(cx, line, bl.value);
        let id = nodeTypes2.length;
        let group = composite ? ["Block", "BlockContext"] : !block ? void 0 : id >= Type.ATXHeading1 && id <= Type.SetextHeading2 ? ["Block", "LeafBlock", "Heading"] : ["Block", "LeafBlock"];
        nodeTypes2.push(import_common.NodeType.define({
          id,
          name,
          props: group && [[import_common.NodeProp.group, group]]
        }));
        if (style) {
          if (!styles)
            styles = {};
          if (Array.isArray(style) || style instanceof import_highlight.Tag)
            styles[name] = style;
          else
            Object.assign(styles, style);
        }
      }
      nodeSet = new import_common.NodeSet(nodeTypes2);
      if (styles)
        nodeSet = nodeSet.extend((0, import_highlight.styleTags)(styles));
    }
    if (nonEmpty(config.props))
      nodeSet = nodeSet.extend(...config.props);
    if (nonEmpty(config.remove)) {
      for (let rm of config.remove) {
        let block = this.blockNames.indexOf(rm), inline = this.inlineNames.indexOf(rm);
        if (block > -1)
          blockParsers[block] = leafBlockParsers[block] = void 0;
        if (inline > -1)
          inlineParsers[inline] = void 0;
      }
    }
    if (nonEmpty(config.parseBlock)) {
      for (let spec2 of config.parseBlock) {
        let found = blockNames.indexOf(spec2.name);
        if (found > -1) {
          blockParsers[found] = spec2.parse;
          leafBlockParsers[found] = spec2.leaf;
        } else {
          let pos = spec2.before ? findName(blockNames, spec2.before) : spec2.after ? findName(blockNames, spec2.after) + 1 : blockNames.length - 1;
          blockParsers.splice(pos, 0, spec2.parse);
          leafBlockParsers.splice(pos, 0, spec2.leaf);
          blockNames.splice(pos, 0, spec2.name);
        }
        if (spec2.endLeaf)
          endLeafBlock.push(spec2.endLeaf);
      }
    }
    if (nonEmpty(config.parseInline)) {
      for (let spec2 of config.parseInline) {
        let found = inlineNames.indexOf(spec2.name);
        if (found > -1) {
          inlineParsers[found] = spec2.parse;
        } else {
          let pos = spec2.before ? findName(inlineNames, spec2.before) : spec2.after ? findName(inlineNames, spec2.after) + 1 : inlineNames.length - 1;
          inlineParsers.splice(pos, 0, spec2.parse);
          inlineNames.splice(pos, 0, spec2.name);
        }
      }
    }
    if (config.wrap)
      wrappers = wrappers.concat(config.wrap);
    return new _MarkdownParser(nodeSet, blockParsers, leafBlockParsers, blockNames, endLeafBlock, skipContextMarkup, inlineParsers, inlineNames, wrappers);
  }
  /**
  @internal
  */
  getNodeType(name) {
    let found = this.nodeTypes[name];
    if (found == null)
      throw new RangeError(`Unknown node type '${name}'`);
    return found;
  }
  /**
  Parse the given piece of inline text at the given offset,
  returning an array of [`Element`](#Element) objects representing
  the inline content.
  */
  parseInline(text, offset) {
    let cx = new InlineContext(this, text, offset);
    outer: for (let pos = offset; pos < cx.end; ) {
      let next = cx.char(pos);
      for (let token of this.inlineParsers)
        if (token) {
          let result = token(cx, next, pos);
          if (result >= 0) {
            pos = result;
            continue outer;
          }
        }
      pos++;
    }
    return cx.resolveMarkers(0);
  }
};
function nonEmpty(a) {
  return a != null && a.length > 0;
}
function resolveConfig(spec) {
  if (!Array.isArray(spec))
    return spec;
  if (spec.length == 0)
    return null;
  let conf = resolveConfig(spec[0]);
  if (spec.length == 1)
    return conf;
  let rest = resolveConfig(spec.slice(1));
  if (!rest || !conf)
    return conf || rest;
  let conc = (a, b) => (a || none).concat(b || none);
  let wrapA = conf.wrap, wrapB = rest.wrap;
  return {
    props: conc(conf.props, rest.props),
    defineNodes: conc(conf.defineNodes, rest.defineNodes),
    parseBlock: conc(conf.parseBlock, rest.parseBlock),
    parseInline: conc(conf.parseInline, rest.parseInline),
    remove: conc(conf.remove, rest.remove),
    wrap: !wrapA ? wrapB : !wrapB ? wrapA : (inner, input, fragments, ranges) => wrapA(wrapB(inner, input, fragments, ranges), input, fragments, ranges)
  };
}
function findName(names, name) {
  let found = names.indexOf(name);
  if (found < 0)
    throw new RangeError(`Position specified relative to unknown parser ${name}`);
  return found;
}
var nodeTypes = [import_common.NodeType.none];
for (let i = 1, name; name = Type[i]; i++) {
  nodeTypes[i] = import_common.NodeType.define({
    id: i,
    name,
    props: i >= Type.Escape ? [] : [[import_common.NodeProp.group, i in DefaultSkipMarkup ? ["Block", "BlockContext"] : ["Block", "LeafBlock"]]],
    top: name == "Document"
  });
}
var none = [];
var Buffer2 = class {
  constructor(nodeSet) {
    this.nodeSet = nodeSet;
    this.content = [];
    this.nodes = [];
  }
  write(type, from, to, children = 0) {
    this.content.push(type, from, to, 4 + children * 4);
    return this;
  }
  writeElements(elts, offset = 0) {
    for (let e of elts)
      e.writeTo(this, offset);
    return this;
  }
  finish(type, length) {
    return import_common.Tree.build({
      buffer: this.content,
      nodeSet: this.nodeSet,
      reused: this.nodes,
      topID: type,
      length
    });
  }
};
var Element = class {
  /**
  @internal
  */
  constructor(type, from, to, children = none) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.children = children;
  }
  /**
  @internal
  */
  writeTo(buf, offset) {
    let startOff = buf.content.length;
    buf.writeElements(this.children, offset);
    buf.content.push(this.type, this.from + offset, this.to + offset, buf.content.length + 4 - startOff);
  }
  /**
  @internal
  */
  toTree(nodeSet) {
    return new Buffer2(nodeSet).writeElements(this.children, -this.from).finish(this.type, this.to - this.from);
  }
};
var TreeElement = class {
  constructor(tree, from) {
    this.tree = tree;
    this.from = from;
  }
  get to() {
    return this.from + this.tree.length;
  }
  get type() {
    return this.tree.type.id;
  }
  get children() {
    return none;
  }
  writeTo(buf, offset) {
    buf.nodes.push(this.tree);
    buf.content.push(buf.nodes.length - 1, this.from + offset, this.to + offset, -1);
  }
  toTree() {
    return this.tree;
  }
};
function elt(type, from, to, children) {
  return new Element(type, from, to, children);
}
var EmphasisUnderscore = { resolve: "Emphasis", mark: "EmphasisMark" };
var EmphasisAsterisk = { resolve: "Emphasis", mark: "EmphasisMark" };
var LinkStart = {};
var ImageStart = {};
var InlineDelimiter = class {
  constructor(type, from, to, side) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.side = side;
  }
};
var Escapable = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
var Punctuation = /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;
try {
  Punctuation = new RegExp("[\\p{S}|\\p{P}]", "u");
} catch (_) {
}
var DefaultInline = {
  Escape(cx, next, start) {
    if (next != 92 || start == cx.end - 1)
      return -1;
    let escaped = cx.char(start + 1);
    for (let i = 0; i < Escapable.length; i++)
      if (Escapable.charCodeAt(i) == escaped)
        return cx.append(elt(Type.Escape, start, start + 2));
    return -1;
  },
  Entity(cx, next, start) {
    if (next != 38)
      return -1;
    let m = /^(?:#\d+|#x[a-f\d]+|\w+);/i.exec(cx.slice(start + 1, start + 31));
    return m ? cx.append(elt(Type.Entity, start, start + 1 + m[0].length)) : -1;
  },
  InlineCode(cx, next, start) {
    if (next != 96 || start && cx.char(start - 1) == 96)
      return -1;
    let pos = start + 1;
    while (pos < cx.end && cx.char(pos) == 96)
      pos++;
    let size = pos - start, curSize = 0;
    for (; pos < cx.end; pos++) {
      if (cx.char(pos) == 96) {
        curSize++;
        if (curSize == size && cx.char(pos + 1) != 96)
          return cx.append(elt(Type.InlineCode, start, pos + 1, [
            elt(Type.CodeMark, start, start + size),
            elt(Type.CodeMark, pos + 1 - size, pos + 1)
          ]));
      } else {
        curSize = 0;
      }
    }
    return -1;
  },
  HTMLTag(cx, next, start) {
    if (next != 60 || start == cx.end - 1)
      return -1;
    let after = cx.slice(start + 1, cx.end);
    let url = /^(?:[a-z][-\w+.]+:[^\s>]+|[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*)>/i.exec(after);
    if (url) {
      return cx.append(elt(Type.Autolink, start, start + 1 + url[0].length, [
        elt(Type.LinkMark, start, start + 1),
        // url[0] includes the closing bracket, so exclude it from this slice
        elt(Type.URL, start + 1, start + url[0].length),
        elt(Type.LinkMark, start + url[0].length, start + 1 + url[0].length)
      ]));
    }
    let comment = /^!--[^>](?:-[^-]|[^-])*?-->/i.exec(after);
    if (comment)
      return cx.append(elt(Type.Comment, start, start + 1 + comment[0].length));
    let procInst = /^\?[^]*?\?>/.exec(after);
    if (procInst)
      return cx.append(elt(Type.ProcessingInstruction, start, start + 1 + procInst[0].length));
    let m = /^(?:![A-Z][^]*?>|!\[CDATA\[[^]*?\]\]>|\/\s*[a-zA-Z][\w-]*\s*>|\s*[a-zA-Z][\w-]*(\s+[a-zA-Z:_][\w-.:]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*(\/\s*)?>)/.exec(after);
    if (!m)
      return -1;
    return cx.append(elt(Type.HTMLTag, start, start + 1 + m[0].length));
  },
  Emphasis(cx, next, start) {
    if (next != 95 && next != 42)
      return -1;
    let pos = start + 1;
    while (cx.char(pos) == next)
      pos++;
    let before = cx.slice(start - 1, start), after = cx.slice(pos, pos + 1);
    let pBefore = Punctuation.test(before), pAfter = Punctuation.test(after);
    let sBefore = /\s|^$/.test(before), sAfter = /\s|^$/.test(after);
    let leftFlanking = !sAfter && (!pAfter || sBefore || pBefore);
    let rightFlanking = !sBefore && (!pBefore || sAfter || pAfter);
    let canOpen = leftFlanking && (next == 42 || !rightFlanking || pBefore);
    let canClose = rightFlanking && (next == 42 || !leftFlanking || pAfter);
    return cx.append(new InlineDelimiter(next == 95 ? EmphasisUnderscore : EmphasisAsterisk, start, pos, (canOpen ? 1 : 0) | (canClose ? 2 : 0)));
  },
  HardBreak(cx, next, start) {
    if (next == 92 && cx.char(start + 1) == 10)
      return cx.append(elt(Type.HardBreak, start, start + 2));
    if (next == 32) {
      let pos = start + 1;
      while (cx.char(pos) == 32)
        pos++;
      if (cx.char(pos) == 10 && pos >= start + 2)
        return cx.append(elt(Type.HardBreak, start, pos + 1));
    }
    return -1;
  },
  Link(cx, next, start) {
    return next == 91 ? cx.append(new InlineDelimiter(
      LinkStart,
      start,
      start + 1,
      1
      /* Mark.Open */
    )) : -1;
  },
  Image(cx, next, start) {
    return next == 33 && cx.char(start + 1) == 91 ? cx.append(new InlineDelimiter(
      ImageStart,
      start,
      start + 2,
      1
      /* Mark.Open */
    )) : -1;
  },
  LinkEnd(cx, next, start) {
    if (next != 93)
      return -1;
    for (let i = cx.parts.length - 1; i >= 0; i--) {
      let part = cx.parts[i];
      if (part instanceof InlineDelimiter && (part.type == LinkStart || part.type == ImageStart)) {
        if (!part.side || cx.skipSpace(part.to) == start && !/[(\[]/.test(cx.slice(start + 1, start + 2))) {
          cx.parts[i] = null;
          return -1;
        }
        let content = cx.takeContent(i);
        let link = cx.parts[i] = finishLink(cx, content, part.type == LinkStart ? Type.Link : Type.Image, part.from, start + 1);
        if (part.type == LinkStart)
          for (let j = 0; j < i; j++) {
            let p = cx.parts[j];
            if (p instanceof InlineDelimiter && p.type == LinkStart)
              p.side = 0;
          }
        return link.to;
      }
    }
    return -1;
  }
};
function finishLink(cx, content, type, start, startPos) {
  let { text } = cx, next = cx.char(startPos), endPos = startPos;
  content.unshift(elt(Type.LinkMark, start, start + (type == Type.Image ? 2 : 1)));
  content.push(elt(Type.LinkMark, startPos - 1, startPos));
  if (next == 40) {
    let pos = cx.skipSpace(startPos + 1);
    let dest = parseURL(text, pos - cx.offset, cx.offset), title;
    if (dest) {
      pos = cx.skipSpace(dest.to);
      if (pos != dest.to) {
        title = parseLinkTitle(text, pos - cx.offset, cx.offset);
        if (title)
          pos = cx.skipSpace(title.to);
      }
    }
    if (cx.char(pos) == 41) {
      content.push(elt(Type.LinkMark, startPos, startPos + 1));
      endPos = pos + 1;
      if (dest)
        content.push(dest);
      if (title)
        content.push(title);
      content.push(elt(Type.LinkMark, pos, endPos));
    }
  } else if (next == 91) {
    let label = parseLinkLabel(text, startPos - cx.offset, cx.offset, false);
    if (label) {
      content.push(label);
      endPos = label.to;
    }
  }
  return elt(type, start, endPos, content);
}
function parseURL(text, start, offset) {
  let next = text.charCodeAt(start);
  if (next == 60) {
    for (let pos = start + 1; pos < text.length; pos++) {
      let ch = text.charCodeAt(pos);
      if (ch == 62)
        return elt(Type.URL, start + offset, pos + 1 + offset);
      if (ch == 60 || ch == 10)
        return false;
    }
    return null;
  } else {
    let depth = 0, pos = start;
    for (let escaped = false; pos < text.length; pos++) {
      let ch = text.charCodeAt(pos);
      if (space(ch)) {
        break;
      } else if (escaped) {
        escaped = false;
      } else if (ch == 40) {
        depth++;
      } else if (ch == 41) {
        if (!depth)
          break;
        depth--;
      } else if (ch == 92) {
        escaped = true;
      }
    }
    return pos > start ? elt(Type.URL, start + offset, pos + offset) : pos == text.length ? null : false;
  }
}
function parseLinkTitle(text, start, offset) {
  let next = text.charCodeAt(start);
  if (next != 39 && next != 34 && next != 40)
    return false;
  let end = next == 40 ? 41 : next;
  for (let pos = start + 1, escaped = false; pos < text.length; pos++) {
    let ch = text.charCodeAt(pos);
    if (escaped)
      escaped = false;
    else if (ch == end)
      return elt(Type.LinkTitle, start + offset, pos + 1 + offset);
    else if (ch == 92)
      escaped = true;
  }
  return null;
}
function parseLinkLabel(text, start, offset, requireNonWS) {
  for (let escaped = false, pos = start + 1, end = Math.min(text.length, pos + 999); pos < end; pos++) {
    let ch = text.charCodeAt(pos);
    if (escaped)
      escaped = false;
    else if (ch == 93)
      return requireNonWS ? false : elt(Type.LinkLabel, start + offset, pos + 1 + offset);
    else {
      if (requireNonWS && !space(ch))
        requireNonWS = false;
      if (ch == 91)
        return false;
      else if (ch == 92)
        escaped = true;
    }
  }
  return null;
}
var InlineContext = class {
  /**
  @internal
  */
  constructor(parser5, text, offset) {
    this.parser = parser5;
    this.text = text;
    this.offset = offset;
    this.parts = [];
  }
  /**
  Get the character code at the given (document-relative)
  position.
  */
  char(pos) {
    return pos >= this.end ? -1 : this.text.charCodeAt(pos - this.offset);
  }
  /**
  The position of the end of this inline section.
  */
  get end() {
    return this.offset + this.text.length;
  }
  /**
  Get a substring of this inline section. Again uses
  document-relative positions.
  */
  slice(from, to) {
    return this.text.slice(from - this.offset, to - this.offset);
  }
  /**
  @internal
  */
  append(elt2) {
    this.parts.push(elt2);
    return elt2.to;
  }
  /**
  Add a [delimiter](#DelimiterType) at this given position. `open`
  and `close` indicate whether this delimiter is opening, closing,
  or both. Returns the end of the delimiter, for convenient
  returning from [parse functions](#InlineParser.parse).
  */
  addDelimiter(type, from, to, open, close) {
    return this.append(new InlineDelimiter(type, from, to, (open ? 1 : 0) | (close ? 2 : 0)));
  }
  /**
  Returns true when there is an unmatched link or image opening
  token before the current position.
  */
  get hasOpenLink() {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      let part = this.parts[i];
      if (part instanceof InlineDelimiter && (part.type == LinkStart || part.type == ImageStart))
        return true;
    }
    return false;
  }
  /**
  Add an inline element. Returns the end of the element.
  */
  addElement(elt2) {
    return this.append(elt2);
  }
  /**
  Resolve markers between this.parts.length and from, wrapping matched markers in the
  appropriate node and updating the content of this.parts. @internal
  */
  resolveMarkers(from) {
    for (let i = from; i < this.parts.length; i++) {
      let close = this.parts[i];
      if (!(close instanceof InlineDelimiter && close.type.resolve && close.side & 2))
        continue;
      let emp = close.type == EmphasisUnderscore || close.type == EmphasisAsterisk;
      let closeSize = close.to - close.from;
      let open, j = i - 1;
      for (; j >= from; j--) {
        let part = this.parts[j];
        if (part instanceof InlineDelimiter && part.side & 1 && part.type == close.type && // Ignore emphasis delimiters where the character count doesn't match
        !(emp && (close.side & 1 || part.side & 2) && (part.to - part.from + closeSize) % 3 == 0 && ((part.to - part.from) % 3 || closeSize % 3))) {
          open = part;
          break;
        }
      }
      if (!open)
        continue;
      let type = close.type.resolve, content = [];
      let start = open.from, end = close.to;
      if (emp) {
        let size = Math.min(2, open.to - open.from, closeSize);
        start = open.to - size;
        end = close.from + size;
        type = size == 1 ? "Emphasis" : "StrongEmphasis";
      }
      if (open.type.mark)
        content.push(this.elt(open.type.mark, start, open.to));
      for (let k = j + 1; k < i; k++) {
        if (this.parts[k] instanceof Element)
          content.push(this.parts[k]);
        this.parts[k] = null;
      }
      if (close.type.mark)
        content.push(this.elt(close.type.mark, close.from, end));
      let element = this.elt(type, start, end, content);
      this.parts[j] = emp && open.from != start ? new InlineDelimiter(open.type, open.from, start, open.side) : null;
      let keep = this.parts[i] = emp && close.to != end ? new InlineDelimiter(close.type, end, close.to, close.side) : null;
      if (keep)
        this.parts.splice(i, 0, element);
      else
        this.parts[i] = element;
    }
    let result = [];
    for (let i = from; i < this.parts.length; i++) {
      let part = this.parts[i];
      if (part instanceof Element)
        result.push(part);
    }
    return result;
  }
  /**
  Find an opening delimiter of the given type. Returns `null` if
  no delimiter is found, or an index that can be passed to
  [`takeContent`](#InlineContext.takeContent) otherwise.
  */
  findOpeningDelimiter(type) {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      let part = this.parts[i];
      if (part instanceof InlineDelimiter && part.type == type && part.side & 1)
        return i;
    }
    return null;
  }
  /**
  Remove all inline elements and delimiters starting from the
  given index (which you should get from
  [`findOpeningDelimiter`](#InlineContext.findOpeningDelimiter),
  resolve delimiters inside of them, and return them as an array
  of elements.
  */
  takeContent(startIndex) {
    let content = this.resolveMarkers(startIndex);
    this.parts.length = startIndex;
    return content;
  }
  /**
  Return the delimiter at the given index. Mostly useful to get
  additional info out of a delimiter index returned by
  [`findOpeningDelimiter`](#InlineContext.findOpeningDelimiter).
  Returns null if there is no delimiter at this index.
  */
  getDelimiterAt(index) {
    let part = this.parts[index];
    return part instanceof InlineDelimiter ? part : null;
  }
  /**
  Skip space after the given (document) position, returning either
  the position of the next non-space character or the end of the
  section.
  */
  skipSpace(from) {
    return skipSpace(this.text, from - this.offset) + this.offset;
  }
  elt(type, from, to, children) {
    if (typeof type == "string")
      return elt(this.parser.getNodeType(type), from, to, children);
    return new TreeElement(type, from);
  }
};
InlineContext.linkStart = LinkStart;
InlineContext.imageStart = ImageStart;
function injectMarks(elements, marks) {
  if (!marks.length)
    return elements;
  if (!elements.length)
    return marks;
  let elts = elements.slice(), eI = 0;
  for (let mark of marks) {
    while (eI < elts.length && elts[eI].to < mark.to)
      eI++;
    if (eI < elts.length && elts[eI].from < mark.from) {
      let e = elts[eI];
      if (e instanceof Element)
        elts[eI] = new Element(e.type, e.from, e.to, injectMarks(e.children, [mark]));
    } else {
      elts.splice(eI++, 0, mark);
    }
  }
  return elts;
}
var NotLast = [Type.CodeBlock, Type.ListItem, Type.OrderedList, Type.BulletList];
var FragmentCursor = class {
  constructor(fragments, input) {
    this.fragments = fragments;
    this.input = input;
    this.i = 0;
    this.fragment = null;
    this.fragmentEnd = -1;
    this.cursor = null;
    if (fragments.length)
      this.fragment = fragments[this.i++];
  }
  nextFragment() {
    this.fragment = this.i < this.fragments.length ? this.fragments[this.i++] : null;
    this.cursor = null;
    this.fragmentEnd = -1;
  }
  moveTo(pos, lineStart) {
    while (this.fragment && this.fragment.to <= pos)
      this.nextFragment();
    if (!this.fragment || this.fragment.from > (pos ? pos - 1 : 0))
      return false;
    if (this.fragmentEnd < 0) {
      let end = this.fragment.to;
      while (end > 0 && this.input.read(end - 1, end) != "\n")
        end--;
      this.fragmentEnd = end ? end - 1 : 0;
    }
    let c = this.cursor;
    if (!c) {
      c = this.cursor = this.fragment.tree.cursor();
      c.firstChild();
    }
    let rPos = pos + this.fragment.offset;
    while (c.to <= rPos)
      if (!c.parent())
        return false;
    for (; ; ) {
      if (c.from >= rPos)
        return this.fragment.from <= lineStart;
      if (!c.childAfter(rPos))
        return false;
    }
  }
  matches(hash2) {
    let tree = this.cursor.tree;
    return tree && tree.prop(import_common.NodeProp.contextHash) == hash2;
  }
  takeNodes(cx) {
    let cur = this.cursor, off = this.fragment.offset, fragEnd = this.fragmentEnd - (this.fragment.openEnd ? 1 : 0);
    let start = cx.absoluteLineStart, end = start, blockI = cx.block.children.length;
    let prevEnd = end, prevI = blockI;
    for (; ; ) {
      if (cur.to - off > fragEnd) {
        if (cur.type.isAnonymous && cur.firstChild())
          continue;
        break;
      }
      let pos = toRelative(cur.from - off, cx.ranges);
      if (cur.to - off <= cx.ranges[cx.rangeI].to) {
        cx.addNode(cur.tree, pos);
      } else {
        let dummy = new import_common.Tree(cx.parser.nodeSet.types[Type.Paragraph], [], [], 0, cx.block.hashProp);
        cx.reusePlaceholders.set(dummy, cur.tree);
        cx.addNode(dummy, pos);
      }
      if (cur.type.is("Block")) {
        if (NotLast.indexOf(cur.type.id) < 0) {
          end = cur.to - off;
          blockI = cx.block.children.length;
        } else {
          end = prevEnd;
          blockI = prevI;
        }
        prevEnd = cur.to - off;
        prevI = cx.block.children.length;
      }
      if (!cur.nextSibling())
        break;
    }
    while (cx.block.children.length > blockI) {
      cx.block.children.pop();
      cx.block.positions.pop();
    }
    return end - start;
  }
};
function toRelative(abs, ranges) {
  let pos = abs;
  for (let i = 1; i < ranges.length; i++) {
    let gapFrom = ranges[i - 1].to, gapTo = ranges[i].from;
    if (gapFrom < abs)
      pos -= gapTo - gapFrom;
  }
  return pos;
}
var markdownHighlighting = (0, import_highlight.styleTags)({
  "Blockquote/...": import_highlight.tags.quote,
  HorizontalRule: import_highlight.tags.contentSeparator,
  "ATXHeading1/... SetextHeading1/...": import_highlight.tags.heading1,
  "ATXHeading2/... SetextHeading2/...": import_highlight.tags.heading2,
  "ATXHeading3/...": import_highlight.tags.heading3,
  "ATXHeading4/...": import_highlight.tags.heading4,
  "ATXHeading5/...": import_highlight.tags.heading5,
  "ATXHeading6/...": import_highlight.tags.heading6,
  "Comment CommentBlock": import_highlight.tags.comment,
  Escape: import_highlight.tags.escape,
  Entity: import_highlight.tags.character,
  "Emphasis/...": import_highlight.tags.emphasis,
  "StrongEmphasis/...": import_highlight.tags.strong,
  "Link/... Image/...": import_highlight.tags.link,
  "OrderedList/... BulletList/...": import_highlight.tags.list,
  "BlockQuote/...": import_highlight.tags.quote,
  "InlineCode CodeText": import_highlight.tags.monospace,
  "URL Autolink": import_highlight.tags.url,
  "HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark": import_highlight.tags.processingInstruction,
  "CodeInfo LinkLabel": import_highlight.tags.labelName,
  LinkTitle: import_highlight.tags.string,
  Paragraph: import_highlight.tags.content
});
var parser = new MarkdownParser(new import_common.NodeSet(nodeTypes).extend(markdownHighlighting), Object.keys(DefaultBlockParsers).map((n) => DefaultBlockParsers[n]), Object.keys(DefaultBlockParsers).map((n) => DefaultLeafBlocks[n]), Object.keys(DefaultBlockParsers), DefaultEndLeaf, DefaultSkipMarkup, Object.keys(DefaultInline).map((n) => DefaultInline[n]), Object.keys(DefaultInline), []);
function leftOverSpace(node, from, to) {
  let ranges = [];
  for (let n = node.firstChild, pos = from; ; n = n.nextSibling) {
    let nextPos = n ? n.from : to;
    if (nextPos > pos)
      ranges.push({ from: pos, to: nextPos });
    if (!n)
      break;
    pos = n.to;
  }
  return ranges;
}
function parseCode(config) {
  let { codeParser, htmlParser } = config;
  let wrap = (0, import_common.parseMixed)((node, input) => {
    let id = node.type.id;
    if (codeParser && (id == Type.CodeBlock || id == Type.FencedCode)) {
      let info = "";
      if (id == Type.FencedCode) {
        let infoNode = node.node.getChild(Type.CodeInfo);
        if (infoNode)
          info = input.read(infoNode.from, infoNode.to);
      }
      let parser5 = codeParser(info);
      if (parser5)
        return { parser: parser5, overlay: (node2) => node2.type.id == Type.CodeText, bracketed: id == Type.FencedCode };
    } else if (htmlParser && (id == Type.HTMLBlock || id == Type.HTMLTag || id == Type.CommentBlock)) {
      return { parser: htmlParser, overlay: leftOverSpace(node.node, node.from, node.to) };
    }
    return null;
  });
  return { wrap };
}
var StrikethroughDelim = { resolve: "Strikethrough", mark: "StrikethroughMark" };
var Strikethrough = {
  defineNodes: [{
    name: "Strikethrough",
    style: { "Strikethrough/...": import_highlight.tags.strikethrough }
  }, {
    name: "StrikethroughMark",
    style: import_highlight.tags.processingInstruction
  }],
  parseInline: [{
    name: "Strikethrough",
    parse(cx, next, pos) {
      if (next != 126 || cx.char(pos + 1) != 126 || cx.char(pos + 2) == 126)
        return -1;
      let before = cx.slice(pos - 1, pos), after = cx.slice(pos + 2, pos + 3);
      let sBefore = /\s|^$/.test(before), sAfter = /\s|^$/.test(after);
      let pBefore = Punctuation.test(before), pAfter = Punctuation.test(after);
      return cx.addDelimiter(StrikethroughDelim, pos, pos + 2, !sAfter && (!pAfter || sBefore || pBefore), !sBefore && (!pBefore || sAfter || pAfter));
    },
    after: "Emphasis"
  }]
};
function parseRow(cx, line, startI = 0, elts, offset = 0) {
  let count2 = 0, first = true, cellStart = -1, cellEnd = -1, esc = false;
  let parseCell = () => {
    elts.push(cx.elt("TableCell", offset + cellStart, offset + cellEnd, cx.parser.parseInline(line.slice(cellStart, cellEnd), offset + cellStart)));
  };
  for (let i = startI; i < line.length; i++) {
    let next = line.charCodeAt(i);
    if (next == 124 && !esc) {
      if (!first || cellStart > -1)
        count2++;
      first = false;
      if (elts) {
        if (cellStart > -1)
          parseCell();
        elts.push(cx.elt("TableDelimiter", i + offset, i + offset + 1));
      }
      cellStart = cellEnd = -1;
    } else if (esc || next != 32 && next != 9) {
      if (cellStart < 0)
        cellStart = i;
      cellEnd = i + 1;
    }
    esc = !esc && next == 92;
  }
  if (cellStart > -1) {
    count2++;
    if (elts)
      parseCell();
  }
  return count2;
}
function hasPipe(str, start) {
  for (let i = start; i < str.length; i++) {
    let next = str.charCodeAt(i);
    if (next == 124)
      return true;
    if (next == 92)
      i++;
  }
  return false;
}
var delimiterLine = /^\|?(\s*:?-+:?\s*\|)+(\s*:?-+:?\s*)?$/;
var TableParser = class {
  constructor() {
    this.rows = null;
  }
  nextLine(cx, line, leaf) {
    if (this.rows == null) {
      this.rows = false;
      let lineText;
      if ((line.next == 45 || line.next == 58 || line.next == 124) && delimiterLine.test(lineText = line.text.slice(line.pos))) {
        let firstRow = [], firstCount = parseRow(cx, leaf.content, 0, firstRow, leaf.start);
        if (firstCount == parseRow(cx, lineText, line.pos))
          this.rows = [
            cx.elt("TableHeader", leaf.start, leaf.start + leaf.content.length, firstRow),
            cx.elt("TableDelimiter", cx.lineStart + line.pos, cx.lineStart + line.text.length)
          ];
      }
    } else if (this.rows) {
      let content = [];
      parseRow(cx, line.text, line.pos, content, cx.lineStart);
      this.rows.push(cx.elt("TableRow", cx.lineStart + line.pos, cx.lineStart + line.text.length, content));
    }
    return false;
  }
  finish(cx, leaf) {
    if (!this.rows)
      return false;
    cx.addLeafElement(leaf, cx.elt("Table", leaf.start, leaf.start + leaf.content.length, this.rows));
    return true;
  }
};
var Table = {
  defineNodes: [
    { name: "Table", block: true },
    { name: "TableHeader", style: { "TableHeader/...": import_highlight.tags.heading } },
    "TableRow",
    { name: "TableCell", style: import_highlight.tags.content },
    { name: "TableDelimiter", style: import_highlight.tags.processingInstruction }
  ],
  parseBlock: [{
    name: "Table",
    leaf(_, leaf) {
      return hasPipe(leaf.content, 0) ? new TableParser() : null;
    },
    endLeaf(cx, line, leaf) {
      if (leaf.parsers.some((p) => p instanceof TableParser) || !hasPipe(line.text, line.basePos))
        return false;
      let next = cx.peekLine();
      return delimiterLine.test(next) && parseRow(cx, line.text, line.basePos) == parseRow(cx, next, line.basePos);
    },
    before: "SetextHeading"
  }]
};
var TaskParser = class {
  nextLine() {
    return false;
  }
  finish(cx, leaf) {
    cx.addLeafElement(leaf, cx.elt("Task", leaf.start, leaf.start + leaf.content.length, [
      cx.elt("TaskMarker", leaf.start, leaf.start + 3),
      ...cx.parser.parseInline(leaf.content.slice(3), leaf.start + 3)
    ]));
    return true;
  }
};
var TaskList = {
  defineNodes: [
    { name: "Task", block: true, style: import_highlight.tags.list },
    { name: "TaskMarker", style: import_highlight.tags.atom }
  ],
  parseBlock: [{
    name: "TaskList",
    leaf(cx, leaf) {
      return /^\[[ xX]\][ \t]/.test(leaf.content) && cx.parentType().name == "ListItem" ? new TaskParser() : null;
    },
    after: "SetextHeading"
  }]
};
var autolinkRE = /(www\.)|(https?:\/\/)|([\w.+-]{1,100}@)|(mailto:|xmpp:)/gy;
var urlRE = /[\w-]+(\.[\w-]+)+(\/[^\s<]*)?/gy;
var lastTwoDomainWords = /[\w-]+\.[\w-]+($|\/)/;
var emailRE = /[\w.+-]+@[\w-]+(\.[\w.-]+)+/gy;
var xmppResourceRE = /\/[a-zA-Z\d@.]+/gy;
function count(str, from, to, ch) {
  let result = 0;
  for (let i = from; i < to; i++)
    if (str[i] == ch)
      result++;
  return result;
}
function autolinkURLEnd(text, from) {
  urlRE.lastIndex = from;
  let m = urlRE.exec(text);
  if (!m || lastTwoDomainWords.exec(m[0])[0].indexOf("_") > -1)
    return -1;
  let end = from + m[0].length;
  for (; ; ) {
    let last = text[end - 1], m2;
    if (/[?!.,:*_~]/.test(last) || last == ")" && count(text, from, end, ")") > count(text, from, end, "("))
      end--;
    else if (last == ";" && (m2 = /&(?:#\d+|#x[a-f\d]+|\w+);$/.exec(text.slice(from, end))))
      end = from + m2.index;
    else
      break;
  }
  return end;
}
function autolinkEmailEnd(text, from) {
  emailRE.lastIndex = from;
  let m = emailRE.exec(text);
  if (!m)
    return -1;
  let last = m[0][m[0].length - 1];
  return last == "_" || last == "-" ? -1 : from + m[0].length - (last == "." ? 1 : 0);
}
var Autolink = {
  parseInline: [{
    name: "Autolink",
    parse(cx, next, absPos) {
      let pos = absPos - cx.offset;
      if (pos && /\w/.test(cx.text[pos - 1]))
        return -1;
      autolinkRE.lastIndex = pos;
      let m = autolinkRE.exec(cx.text), end = -1;
      if (!m)
        return -1;
      if (m[1] || m[2]) {
        end = autolinkURLEnd(cx.text, pos + m[0].length);
        if (end > -1 && cx.hasOpenLink) {
          let noBracket = /([^\[\]]|\[[^\]]*\])*/.exec(cx.text.slice(pos, end));
          end = pos + noBracket[0].length;
        }
      } else if (m[3]) {
        end = autolinkEmailEnd(cx.text, pos);
      } else {
        end = autolinkEmailEnd(cx.text, pos + m[0].length);
        if (end > -1 && m[0] == "xmpp:") {
          xmppResourceRE.lastIndex = end;
          m = xmppResourceRE.exec(cx.text);
          if (m)
            end = m.index + m[0].length;
        }
      }
      if (end < 0)
        return -1;
      cx.addElement(cx.elt("URL", absPos, end + cx.offset));
      return end + cx.offset;
    }
  }]
};
var GFM = [Table, TaskList, Strikethrough, Autolink];
function parseSubSuper(ch, node, mark) {
  return (cx, next, pos) => {
    if (next != ch || cx.char(pos + 1) == ch)
      return -1;
    let elts = [cx.elt(mark, pos, pos + 1)];
    for (let i = pos + 1; i < cx.end; i++) {
      let next2 = cx.char(i);
      if (next2 == ch)
        return cx.addElement(cx.elt(node, pos, i + 1, elts.concat(cx.elt(mark, i, i + 1))));
      if (next2 == 92)
        elts.push(cx.elt("Escape", i, i++ + 2));
      if (space(next2))
        break;
    }
    return -1;
  };
}
var Superscript = {
  defineNodes: [
    { name: "Superscript", style: import_highlight.tags.special(import_highlight.tags.content) },
    { name: "SuperscriptMark", style: import_highlight.tags.processingInstruction }
  ],
  parseInline: [{
    name: "Superscript",
    parse: parseSubSuper(94, "Superscript", "SuperscriptMark")
  }]
};
var Subscript = {
  defineNodes: [
    { name: "Subscript", style: import_highlight.tags.special(import_highlight.tags.content) },
    { name: "SubscriptMark", style: import_highlight.tags.processingInstruction }
  ],
  parseInline: [{
    name: "Subscript",
    parse: parseSubSuper(126, "Subscript", "SubscriptMark")
  }]
};
var Emoji = {
  defineNodes: [{ name: "Emoji", style: import_highlight.tags.character }],
  parseInline: [{
    name: "Emoji",
    parse(cx, next, pos) {
      let match;
      if (next != 58 || !(match = /^[a-zA-Z_0-9]+:/.exec(cx.slice(pos + 1, cx.end))))
        return -1;
      return cx.addElement(cx.elt("Emoji", pos, pos + 1 + match[0].length));
    }
  }]
};

// node_modules/@lezer/html/dist/index.js
var import_lr = require("@lezer/lr");
var import_highlight2 = require("@lezer/highlight");
var import_common2 = require("@lezer/common");
var scriptText = 55;
var StartCloseScriptTag = 1;
var styleText = 56;
var StartCloseStyleTag = 2;
var textareaText = 57;
var StartCloseTextareaTag = 3;
var EndTag = 4;
var SelfClosingEndTag = 5;
var StartTag = 6;
var StartScriptTag = 7;
var StartStyleTag = 8;
var StartTextareaTag = 9;
var StartSelfClosingTag = 10;
var StartCloseTag = 11;
var NoMatchStartCloseTag = 12;
var MismatchedStartCloseTag = 13;
var missingCloseTag = 58;
var IncompleteTag = 14;
var IncompleteCloseTag = 15;
var commentContent$1 = 59;
var Element2 = 21;
var TagName = 23;
var Attribute = 24;
var AttributeName = 25;
var AttributeValue = 27;
var UnquotedAttributeValue = 28;
var ScriptText = 29;
var StyleText = 32;
var TextareaText = 35;
var OpenTag = 37;
var CloseTag = 38;
var Dialect_noMatch = 0;
var Dialect_selfClosing = 1;
var selfClosers = {
  area: true,
  base: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
  menuitem: true
};
var implicitlyClosed = {
  dd: true,
  li: true,
  optgroup: true,
  option: true,
  p: true,
  rp: true,
  rt: true,
  tbody: true,
  td: true,
  tfoot: true,
  th: true,
  tr: true
};
var closeOnOpen = {
  dd: { dd: true, dt: true },
  dt: { dd: true, dt: true },
  li: { li: true },
  option: { option: true, optgroup: true },
  optgroup: { optgroup: true },
  p: {
    address: true,
    article: true,
    aside: true,
    blockquote: true,
    dir: true,
    div: true,
    dl: true,
    fieldset: true,
    footer: true,
    form: true,
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
    header: true,
    hgroup: true,
    hr: true,
    menu: true,
    nav: true,
    ol: true,
    p: true,
    pre: true,
    section: true,
    table: true,
    ul: true
  },
  rp: { rp: true, rt: true },
  rt: { rp: true, rt: true },
  tbody: { tbody: true, tfoot: true },
  td: { td: true, th: true },
  tfoot: { tbody: true },
  th: { td: true, th: true },
  thead: { tbody: true, tfoot: true },
  tr: { tr: true }
};
function nameChar(ch) {
  return ch == 45 || ch == 46 || ch == 58 || ch >= 65 && ch <= 90 || ch == 95 || ch >= 97 && ch <= 122 || ch >= 161;
}
var cachedName = null;
var cachedInput = null;
var cachedPos = 0;
function tagNameAfter(input, offset) {
  let pos = input.pos + offset;
  if (cachedPos == pos && cachedInput == input) return cachedName;
  let next = input.peek(offset), name = "";
  for (; ; ) {
    if (!nameChar(next)) break;
    name += String.fromCharCode(next);
    next = input.peek(++offset);
  }
  cachedInput = input;
  cachedPos = pos;
  return cachedName = name ? name.toLowerCase() : next == question || next == bang ? void 0 : null;
}
var lessThan = 60;
var greaterThan = 62;
var slash = 47;
var question = 63;
var bang = 33;
var dash = 45;
function ElementContext(name, parent) {
  this.name = name;
  this.parent = parent;
}
var startTagTerms = [StartTag, StartSelfClosingTag, StartScriptTag, StartStyleTag, StartTextareaTag];
var elementContext = new import_lr.ContextTracker({
  start: null,
  shift(context, term, stack, input) {
    return startTagTerms.indexOf(term) > -1 ? new ElementContext(tagNameAfter(input, 1) || "", context) : context;
  },
  reduce(context, term) {
    return term == Element2 && context ? context.parent : context;
  },
  reuse(context, node, stack, input) {
    let type = node.type.id;
    return type == StartTag || type == OpenTag ? new ElementContext(tagNameAfter(input, 1) || "", context) : context;
  },
  strict: false
});
var tagStart = new import_lr.ExternalTokenizer((input, stack) => {
  if (input.next != lessThan) {
    if (input.next < 0 && stack.context) input.acceptToken(missingCloseTag);
    return;
  }
  input.advance();
  let close = input.next == slash;
  if (close) input.advance();
  let name = tagNameAfter(input, 0);
  if (name === void 0) return;
  if (!name) return input.acceptToken(close ? IncompleteCloseTag : IncompleteTag);
  let parent = stack.context ? stack.context.name : null;
  if (close) {
    if (name == parent) return input.acceptToken(StartCloseTag);
    if (parent && implicitlyClosed[parent]) return input.acceptToken(missingCloseTag, -2);
    if (stack.dialectEnabled(Dialect_noMatch)) return input.acceptToken(NoMatchStartCloseTag);
    for (let cx = stack.context; cx; cx = cx.parent) if (cx.name == name) return;
    input.acceptToken(MismatchedStartCloseTag);
  } else {
    if (name == "script") return input.acceptToken(StartScriptTag);
    if (name == "style") return input.acceptToken(StartStyleTag);
    if (name == "textarea") return input.acceptToken(StartTextareaTag);
    if (selfClosers.hasOwnProperty(name)) return input.acceptToken(StartSelfClosingTag);
    if (parent && closeOnOpen[parent] && closeOnOpen[parent][name]) input.acceptToken(missingCloseTag, -1);
    else input.acceptToken(StartTag);
  }
}, { contextual: true });
var commentContent = new import_lr.ExternalTokenizer((input) => {
  for (let dashes = 0, i = 0; ; i++) {
    if (input.next < 0) {
      if (i) input.acceptToken(commentContent$1);
      break;
    }
    if (input.next == dash) {
      dashes++;
    } else if (input.next == greaterThan && dashes >= 2) {
      if (i >= 3) input.acceptToken(commentContent$1, -2);
      break;
    } else {
      dashes = 0;
    }
    input.advance();
  }
});
function inForeignElement(context) {
  for (; context; context = context.parent)
    if (context.name == "svg" || context.name == "math") return true;
  return false;
}
var endTag = new import_lr.ExternalTokenizer((input, stack) => {
  if (input.next == slash && input.peek(1) == greaterThan) {
    let selfClosing = stack.dialectEnabled(Dialect_selfClosing) || inForeignElement(stack.context);
    input.acceptToken(selfClosing ? SelfClosingEndTag : EndTag, 2);
  } else if (input.next == greaterThan) {
    input.acceptToken(EndTag, 1);
  }
});
function contentTokenizer(tag, textToken, endToken) {
  let lastState = 2 + tag.length;
  return new import_lr.ExternalTokenizer((input) => {
    for (let state = 0, matchedLen = 0, i = 0; ; i++) {
      if (input.next < 0) {
        if (i) input.acceptToken(textToken);
        break;
      }
      if (state == 0 && input.next == lessThan || state == 1 && input.next == slash || state >= 2 && state < lastState && input.next == tag.charCodeAt(state - 2)) {
        state++;
        matchedLen++;
      } else if (state == lastState && input.next == greaterThan) {
        if (i > matchedLen)
          input.acceptToken(textToken, -matchedLen);
        else
          input.acceptToken(endToken, -(matchedLen - 2));
        break;
      } else if ((input.next == 10 || input.next == 13) && i) {
        input.acceptToken(textToken, 1);
        break;
      } else {
        state = matchedLen = 0;
      }
      input.advance();
    }
  });
}
var scriptTokens = contentTokenizer("script", scriptText, StartCloseScriptTag);
var styleTokens = contentTokenizer("style", styleText, StartCloseStyleTag);
var textareaTokens = contentTokenizer("textarea", textareaText, StartCloseTextareaTag);
var htmlHighlighting = (0, import_highlight2.styleTags)({
  "Text RawText IncompleteTag IncompleteCloseTag": import_highlight2.tags.content,
  "StartTag StartCloseTag SelfClosingEndTag EndTag": import_highlight2.tags.angleBracket,
  TagName: import_highlight2.tags.tagName,
  "MismatchedCloseTag/TagName": [import_highlight2.tags.tagName, import_highlight2.tags.invalid],
  AttributeName: import_highlight2.tags.attributeName,
  "AttributeValue UnquotedAttributeValue": import_highlight2.tags.attributeValue,
  Is: import_highlight2.tags.definitionOperator,
  "EntityReference CharacterReference": import_highlight2.tags.character,
  Comment: import_highlight2.tags.blockComment,
  ProcessingInst: import_highlight2.tags.processingInstruction,
  DoctypeDecl: import_highlight2.tags.documentMeta
});
var parser2 = import_lr.LRParser.deserialize({
  version: 14,
  states: ",xOVO!rOOO!ZQ#tO'#CrO!`Q#tO'#C{O!eQ#tO'#DOO!jQ#tO'#DRO!oQ#tO'#DTO!tOaO'#CqO#PObO'#CqO#[OdO'#CqO$kO!rO'#CqOOO`'#Cq'#CqO$rO$fO'#DUO$zQ#tO'#DWO%PQ#tO'#DXOOO`'#Dl'#DlOOO`'#DZ'#DZQVO!rOOO%UQ&rO,59^O%aQ&rO,59gO%lQ&rO,59jO%wQ&rO,59mO&SQ&rO,59oOOOa'#D_'#D_O&_OaO'#CyO&jOaO,59]OOOb'#D`'#D`O&rObO'#C|O&}ObO,59]OOOd'#Da'#DaO'VOdO'#DPO'bOdO,59]OOO`'#Db'#DbO'jO!rO,59]O'qQ#tO'#DSOOO`,59],59]OOOp'#Dc'#DcO'vO$fO,59pOOO`,59p,59pO(OQ#|O,59rO(TQ#|O,59sOOO`-E7X-E7XO(YQ&rO'#CtOOQW'#D['#D[O(hQ&rO1G.xOOOa1G.x1G.xOOO`1G/Z1G/ZO(sQ&rO1G/ROOOb1G/R1G/RO)OQ&rO1G/UOOOd1G/U1G/UO)ZQ&rO1G/XOOO`1G/X1G/XO)fQ&rO1G/ZOOOa-E7]-E7]O)qQ#tO'#CzOOO`1G.w1G.wOOOb-E7^-E7^O)vQ#tO'#C}OOOd-E7_-E7_O){Q#tO'#DQOOO`-E7`-E7`O*QQ#|O,59nOOOp-E7a-E7aOOO`1G/[1G/[OOO`1G/^1G/^OOO`1G/_1G/_O*VQ,UO,59`OOQW-E7Y-E7YOOOa7+$d7+$dOOO`7+$u7+$uOOOb7+$m7+$mOOOd7+$p7+$pOOO`7+$s7+$sO*bQ#|O,59fO*gQ#|O,59iO*lQ#|O,59lOOO`1G/Y1G/YO*qO7[O'#CwO+SOMhO'#CwOOQW1G.z1G.zOOO`1G/Q1G/QOOO`1G/T1G/TOOO`1G/W1G/WOOOO'#D]'#D]O+eO7[O,59cOOQW,59c,59cOOOO'#D^'#D^O+vOMhO,59cOOOO-E7Z-E7ZOOQW1G.}1G.}OOOO-E7[-E7[",
  stateData: ",c~O!_OS~OUSOVPOWQOXROYTO[]O][O^^O_^Oa^Ob^Oc^Od^Oy^O|_O!eZO~OgaO~OgbO~OgcO~OgdO~OgeO~O!XfOPmP![mP~O!YiOQpP![pP~O!ZlORsP![sP~OUSOVPOWQOXROYTOZqO[]O][O^^O_^Oa^Ob^Oc^Od^Oy^O!eZO~O![rO~P#gO!]sO!fuO~OgvO~OgwO~OS|OT}OiyO~OS!POT}OiyO~OS!ROT}OiyO~OS!TOT}OiyO~OS}OT}OiyO~O!XfOPmX![mX~OP!WO![!XO~O!YiOQpX![pX~OQ!ZO![!XO~O!ZlORsX![sX~OR!]O![!XO~O![!XO~P#gOg!_O~O!]sO!f!aO~OS!bO~OS!cO~Oj!dOShXThXihX~OS!fOT!gOiyO~OS!hOT!gOiyO~OS!iOT!gOiyO~OS!jOT!gOiyO~OS!gOT!gOiyO~Og!kO~Og!lO~Og!mO~OS!nO~Ol!qO!a!oO!c!pO~OS!rO~OS!sO~OS!tO~Ob!uOc!uOd!uO!a!wO!b!uO~Ob!xOc!xOd!xO!c!wO!d!xO~Ob!uOc!uOd!uO!a!{O!b!uO~Ob!xOc!xOd!xO!c!{O!d!xO~OT~cbd!ey|!e~",
  goto: "%q!aPPPPPPPPPPPPPPPPPPPPP!b!hP!nPP!zP!}#Q#T#Z#^#a#g#j#m#s#y!bP!b!bP$P$V$m$s$y%P%V%]%cPPPPPPPP%iX^OX`pXUOX`pezabcde{!O!Q!S!UR!q!dRhUR!XhXVOX`pRkVR!XkXWOX`pRnWR!XnXXOX`pQrXR!XpXYOX`pQ`ORx`Q{aQ!ObQ!QcQ!SdQ!UeZ!e{!O!Q!S!UQ!v!oR!z!vQ!y!pR!|!yQgUR!VgQjVR!YjQmWR![mQpXR!^pQtZR!`tS_O`ToXp",
  nodeNames: "\u26A0 StartCloseTag StartCloseTag StartCloseTag EndTag SelfClosingEndTag StartTag StartTag StartTag StartTag StartTag StartCloseTag StartCloseTag StartCloseTag IncompleteTag IncompleteCloseTag Document Text EntityReference CharacterReference InvalidEntity Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue ScriptText CloseTag OpenTag StyleText CloseTag OpenTag TextareaText CloseTag OpenTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag CloseTag DoctypeDecl",
  maxTerm: 68,
  context: elementContext,
  nodeProps: [
    ["closedBy", -10, 1, 2, 3, 7, 8, 9, 10, 11, 12, 13, "EndTag", 6, "EndTag SelfClosingEndTag", -4, 22, 31, 34, 37, "CloseTag"],
    ["openedBy", 4, "StartTag StartCloseTag", 5, "StartTag", -4, 30, 33, 36, 38, "OpenTag"],
    ["group", -10, 14, 15, 18, 19, 20, 21, 40, 41, 42, 43, "Entity", 17, "Entity TextContent", -3, 29, 32, 35, "TextContent Entity"],
    ["isolate", -11, 22, 30, 31, 33, 34, 36, 37, 38, 39, 42, 43, "ltr", -3, 27, 28, 40, ""]
  ],
  propSources: [htmlHighlighting],
  skippedNodes: [0],
  repeatNodeCount: 9,
  tokenData: "!<p!aR!YOX$qXY,QYZ,QZ[$q[]&X]^,Q^p$qpq,Qqr-_rs3_sv-_vw3}wxHYx}-_}!OH{!O!P-_!P!Q$q!Q![-_![!]Mz!]!^-_!^!_!$S!_!`!;x!`!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4U-_4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!Z$|caPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr$qrs&}sv$qvw+Pwx(tx!^$q!^!_*V!_!a&X!a#S$q#S#T&X#T;'S$q;'S;=`+z<%lO$q!R&bXaP!b`!dpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&Xq'UVaP!dpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}P'pTaPOv'kw!^'k!_;'S'k;'S;=`(P<%lO'kP(SP;=`<%l'kp([S!dpOv(Vx;'S(V;'S;=`(h<%lO(Vp(kP;=`<%l(Vq(qP;=`<%l&}a({WaP!b`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t`)jT!b`Or)esv)ew;'S)e;'S;=`)y<%lO)e`)|P;=`<%l)ea*SP;=`<%l(t!Q*^V!b`!dpOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!Q*vP;=`<%l*V!R*|P;=`<%l&XW+UYlWOX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+PW+wP;=`<%l+P!Z+}P;=`<%l$q!a,]`aP!b`!dp!_^OX&XXY,QYZ,QZ]&X]^,Q^p&Xpq,Qqr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!_-ljiSaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q[/ebiSlWOX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+PS0rXiSqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0mS1bP;=`<%l0m[1hP;=`<%l/^!V1vciSaP!b`!dpOq&Xqr1krs&}sv1kvw0mwx(tx!P1k!P!Q&X!Q!^1k!^!_*V!_!a&X!a#s1k#s$f&X$f;'S1k;'S;=`3R<%l?Ah1k?Ah?BY&X?BY?Mn1k?MnO&X!V3UP;=`<%l1k!_3[P;=`<%l-_!Z3hV!ahaP!dpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}!_4WiiSlWd!ROX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst>]tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^/^!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!Z5zblWOX5uXZ7SZ[5u[^7S^p5uqr5urs7Sst+Ptw5uwx7Sx!]5u!]!^7w!^!a7S!a#S5u#S#T7S#T;'S5u;'S;=`8n<%lO5u!R7VVOp7Sqs7St!]7S!]!^7l!^;'S7S;'S;=`7q<%lO7S!R7qOb!R!R7tP;=`<%l7S!Z8OYlWb!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!Z8qP;=`<%l5u!_8{iiSlWOX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst/^tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^:j!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!_:sbiSlWb!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!V<QciSOp7Sqr;{rs7Sst0mtw;{wx7Sx!P;{!P!Q7S!Q!];{!]!^=]!^!a7S!a#s;{#s$f7S$f;'S;{;'S;=`>P<%l?Ah;{?Ah?BY7S?BY?Mn;{?MnO7S!V=dXiSb!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!V>SP;=`<%l;{!_>YP;=`<%l8t!_>dhiSlWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^/^!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!Z@TalWOX@OXZAYZ[@O[^AY^p@Oqr@OrsAYsw@OwxAYx!]@O!]!^Az!^!aAY!a#S@O#S#TAY#T;'S@O;'S;=`Bq<%lO@O!RA]UOpAYq!]AY!]!^Ao!^;'SAY;'S;=`At<%lOAY!RAtOc!R!RAwP;=`<%lAY!ZBRYlWc!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!ZBtP;=`<%l@O!_COhiSlWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^Dj!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!_DsbiSlWc!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!VFQbiSOpAYqrE{rsAYswE{wxAYx!PE{!P!QAY!Q!]E{!]!^GY!^!aAY!a#sE{#s$fAY$f;'SE{;'S;=`G|<%l?AhE{?Ah?BYAY?BY?MnE{?MnOAY!VGaXiSc!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!VHPP;=`<%lE{!_HVP;=`<%lBw!ZHcW!cxaP!b`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t!aIYliSaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OKQ!O!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!aK_kiSaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!`&X!`!aMS!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!TM_XaP!b`!dp!fQOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!aNZ!ZiSgQaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OMz!O!PMz!P!Q$q!Q![Mz![!]Mz!]!^-_!^!_*V!_!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f$}-_$}%OMz%O%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4UMz4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Je-_$Je$JgMz$Jg$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!a!$PP;=`<%lMz!R!$ZY!b`!dpOq*Vqr!$yrs(Vsv*Vwx)ex!a*V!a!b!4t!b;'S*V;'S;=`*s<%lO*V!R!%Q]!b`!dpOr*Vrs(Vsv*Vwx)ex}*V}!O!%y!O!f*V!f!g!']!g#W*V#W#X!0`#X;'S*V;'S;=`*s<%lO*V!R!&QX!b`!dpOr*Vrs(Vsv*Vwx)ex}*V}!O!&m!O;'S*V;'S;=`*s<%lO*V!R!&vV!b`!dp!ePOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!'dX!b`!dpOr*Vrs(Vsv*Vwx)ex!q*V!q!r!(P!r;'S*V;'S;=`*s<%lO*V!R!(WX!b`!dpOr*Vrs(Vsv*Vwx)ex!e*V!e!f!(s!f;'S*V;'S;=`*s<%lO*V!R!(zX!b`!dpOr*Vrs(Vsv*Vwx)ex!v*V!v!w!)g!w;'S*V;'S;=`*s<%lO*V!R!)nX!b`!dpOr*Vrs(Vsv*Vwx)ex!{*V!{!|!*Z!|;'S*V;'S;=`*s<%lO*V!R!*bX!b`!dpOr*Vrs(Vsv*Vwx)ex!r*V!r!s!*}!s;'S*V;'S;=`*s<%lO*V!R!+UX!b`!dpOr*Vrs(Vsv*Vwx)ex!g*V!g!h!+q!h;'S*V;'S;=`*s<%lO*V!R!+xY!b`!dpOr!+qrs!,hsv!+qvw!-Swx!.[x!`!+q!`!a!/j!a;'S!+q;'S;=`!0Y<%lO!+qq!,mV!dpOv!,hvx!-Sx!`!,h!`!a!-q!a;'S!,h;'S;=`!.U<%lO!,hP!-VTO!`!-S!`!a!-f!a;'S!-S;'S;=`!-k<%lO!-SP!-kO|PP!-nP;=`<%l!-Sq!-xS!dp|POv(Vx;'S(V;'S;=`(h<%lO(Vq!.XP;=`<%l!,ha!.aX!b`Or!.[rs!-Ssv!.[vw!-Sw!`!.[!`!a!.|!a;'S!.[;'S;=`!/d<%lO!.[a!/TT!b`|POr)esv)ew;'S)e;'S;=`)y<%lO)ea!/gP;=`<%l!.[!R!/sV!b`!dp|POr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!0]P;=`<%l!+q!R!0gX!b`!dpOr*Vrs(Vsv*Vwx)ex#c*V#c#d!1S#d;'S*V;'S;=`*s<%lO*V!R!1ZX!b`!dpOr*Vrs(Vsv*Vwx)ex#V*V#V#W!1v#W;'S*V;'S;=`*s<%lO*V!R!1}X!b`!dpOr*Vrs(Vsv*Vwx)ex#h*V#h#i!2j#i;'S*V;'S;=`*s<%lO*V!R!2qX!b`!dpOr*Vrs(Vsv*Vwx)ex#m*V#m#n!3^#n;'S*V;'S;=`*s<%lO*V!R!3eX!b`!dpOr*Vrs(Vsv*Vwx)ex#d*V#d#e!4Q#e;'S*V;'S;=`*s<%lO*V!R!4XX!b`!dpOr*Vrs(Vsv*Vwx)ex#X*V#X#Y!+q#Y;'S*V;'S;=`*s<%lO*V!R!4{Y!b`!dpOr!4trs!5ksv!4tvw!6Vwx!8]x!a!4t!a!b!:]!b;'S!4t;'S;=`!;r<%lO!4tq!5pV!dpOv!5kvx!6Vx!a!5k!a!b!7W!b;'S!5k;'S;=`!8V<%lO!5kP!6YTO!a!6V!a!b!6i!b;'S!6V;'S;=`!7Q<%lO!6VP!6lTO!`!6V!`!a!6{!a;'S!6V;'S;=`!7Q<%lO!6VP!7QOyPP!7TP;=`<%l!6Vq!7]V!dpOv!5kvx!6Vx!`!5k!`!a!7r!a;'S!5k;'S;=`!8V<%lO!5kq!7yS!dpyPOv(Vx;'S(V;'S;=`(h<%lO(Vq!8YP;=`<%l!5ka!8bX!b`Or!8]rs!6Vsv!8]vw!6Vw!a!8]!a!b!8}!b;'S!8];'S;=`!:V<%lO!8]a!9SX!b`Or!8]rs!6Vsv!8]vw!6Vw!`!8]!`!a!9o!a;'S!8];'S;=`!:V<%lO!8]a!9vT!b`yPOr)esv)ew;'S)e;'S;=`)y<%lO)ea!:YP;=`<%l!8]!R!:dY!b`!dpOr!4trs!5ksv!4tvw!6Vwx!8]x!`!4t!`!a!;S!a;'S!4t;'S;=`!;r<%lO!4t!R!;]V!b`!dpyPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!;uP;=`<%l!4t!V!<TXjSaP!b`!dpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X",
  tokenizers: [scriptTokens, styleTokens, textareaTokens, endTag, tagStart, commentContent, 0, 1, 2, 3, 4, 5],
  topRules: { "Document": [0, 16] },
  dialects: { noMatch: 0, selfClosing: 515 },
  tokenPrec: 517
});
function getAttrs(openTag, input) {
  let attrs = /* @__PURE__ */ Object.create(null);
  for (let att of openTag.getChildren(Attribute)) {
    let name = att.getChild(AttributeName), value = att.getChild(AttributeValue) || att.getChild(UnquotedAttributeValue);
    if (name) attrs[input.read(name.from, name.to)] = !value ? "" : value.type.id == AttributeValue ? input.read(value.from + 1, value.to - 1) : input.read(value.from, value.to);
  }
  return attrs;
}
function findTagName(openTag, input) {
  let tagNameNode = openTag.getChild(TagName);
  return tagNameNode ? input.read(tagNameNode.from, tagNameNode.to) : " ";
}
function maybeNest(node, input, tags7) {
  let attrs;
  for (let tag of tags7) {
    if (!tag.attrs || tag.attrs(attrs || (attrs = getAttrs(node.node.parent.firstChild, input))))
      return { parser: tag.parser, bracketed: true };
  }
  return null;
}
function configureNesting(tags7 = [], attributes = []) {
  let script = [], style = [], textarea = [], other = [];
  for (let tag of tags7) {
    let array = tag.tag == "script" ? script : tag.tag == "style" ? style : tag.tag == "textarea" ? textarea : other;
    array.push(tag);
  }
  let attrs = attributes.length ? /* @__PURE__ */ Object.create(null) : null;
  for (let attr of attributes) (attrs[attr.name] || (attrs[attr.name] = [])).push(attr);
  return (0, import_common2.parseMixed)((node, input) => {
    let id = node.type.id;
    if (id == ScriptText) return maybeNest(node, input, script);
    if (id == StyleText) return maybeNest(node, input, style);
    if (id == TextareaText) return maybeNest(node, input, textarea);
    if (id == Element2 && other.length) {
      let n = node.node, open = n.firstChild, tagName = open && findTagName(open, input), attrs2;
      if (tagName) for (let tag of other) {
        if (tag.tag == tagName && (!tag.attrs || tag.attrs(attrs2 || (attrs2 = getAttrs(open, input))))) {
          let close = n.lastChild;
          let to = close.type.id == CloseTag ? close.from : n.to;
          if (to > open.to)
            return { parser: tag.parser, overlay: [{ from: open.to, to }] };
        }
      }
    }
    if (attrs && id == Attribute) {
      let n = node.node, nameNode;
      if (nameNode = n.firstChild) {
        let matches = attrs[input.read(nameNode.from, nameNode.to)];
        if (matches) for (let attr of matches) {
          if (attr.tagName && attr.tagName != findTagName(n.parent, input)) continue;
          let value = n.lastChild;
          if (value.type.id == AttributeValue) {
            let from = value.from + 1;
            let last = value.lastChild, to = value.to - (last && last.isError ? 0 : 1);
            if (to > from) return { parser: attr.parser, overlay: [{ from, to }], bracketed: true };
          } else if (value.type.id == UnquotedAttributeValue) {
            return { parser: attr.parser, overlay: [{ from: value.from, to: value.to }] };
          }
        }
      }
    }
    return null;
  });
}

// node_modules/@lezer/css/dist/index.js
var import_lr2 = require("@lezer/lr");
var import_highlight3 = require("@lezer/highlight");
var descendantOp = 135;
var Unit = 1;
var identifier = 136;
var callee = 137;
var VariableName = 2;
var queryIdentifier = 138;
var queryVariableName = 3;
var QueryCallee = 4;
var space2 = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
];
var colon = 58;
var parenL = 40;
var underscore = 95;
var bracketL = 91;
var dash2 = 45;
var period = 46;
var hash = 35;
var percent = 37;
var ampersand = 38;
var backslash = 92;
var newline = 10;
var asterisk = 42;
function isAlpha(ch) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 161;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
function isHex(ch) {
  return isDigit(ch) || ch >= 97 && ch <= 102 || ch >= 65 && ch <= 70;
}
var identifierTokens = (id, varName, callee2) => (input, stack) => {
  for (let inside = false, dashes = 0, i = 0; ; i++) {
    let { next } = input;
    if (isAlpha(next) || next == dash2 || next == underscore || inside && isDigit(next)) {
      if (!inside && (next != dash2 || i > 0)) inside = true;
      if (dashes === i && next == dash2) dashes++;
      input.advance();
    } else if (next == backslash && input.peek(1) != newline) {
      input.advance();
      if (isHex(input.next)) {
        do {
          input.advance();
        } while (isHex(input.next));
        if (input.next == 32) input.advance();
      } else if (input.next > -1) {
        input.advance();
      }
      inside = true;
    } else {
      if (inside) input.acceptToken(
        dashes == 2 && stack.canShift(VariableName) ? varName : next == parenL ? callee2 : id
      );
      break;
    }
  }
};
var identifiers = new import_lr2.ExternalTokenizer(
  identifierTokens(identifier, VariableName, callee),
  { contextual: true }
);
var queryIdentifiers = new import_lr2.ExternalTokenizer(
  identifierTokens(queryIdentifier, queryVariableName, QueryCallee),
  { contextual: true }
);
var descendant = new import_lr2.ExternalTokenizer((input) => {
  if (space2.includes(input.peek(-1))) {
    let { next } = input;
    if (isAlpha(next) || next == underscore || next == hash || next == period || next == asterisk || next == bracketL || next == colon && isAlpha(input.peek(1)) || next == dash2 || next == ampersand)
      input.acceptToken(descendantOp);
  }
});
var unitToken = new import_lr2.ExternalTokenizer((input) => {
  if (!space2.includes(input.peek(-1))) {
    let { next } = input;
    if (next == percent) {
      input.advance();
      input.acceptToken(Unit);
    }
    if (isAlpha(next)) {
      do {
        input.advance();
      } while (isAlpha(input.next) || isDigit(input.next));
      input.acceptToken(Unit);
    }
  }
});
var cssHighlighting = (0, import_highlight3.styleTags)({
  "AtKeyword import charset namespace keyframes media supports font-feature-values": import_highlight3.tags.definitionKeyword,
  "from to selector scope MatchFlag": import_highlight3.tags.keyword,
  NamespaceName: import_highlight3.tags.namespace,
  KeyframeName: import_highlight3.tags.labelName,
  KeyframeRangeName: import_highlight3.tags.operatorKeyword,
  TagName: import_highlight3.tags.tagName,
  ClassName: import_highlight3.tags.className,
  PseudoClassName: import_highlight3.tags.constant(import_highlight3.tags.className),
  IdName: import_highlight3.tags.labelName,
  "FeatureName PropertyName": import_highlight3.tags.propertyName,
  AttributeName: import_highlight3.tags.attributeName,
  NumberLiteral: import_highlight3.tags.number,
  KeywordQuery: import_highlight3.tags.keyword,
  UnaryQueryOp: import_highlight3.tags.operatorKeyword,
  "CallTag ValueName FontName": import_highlight3.tags.atom,
  VariableName: import_highlight3.tags.variableName,
  Callee: import_highlight3.tags.operatorKeyword,
  Unit: import_highlight3.tags.unit,
  "UniversalSelector NestingSelector": import_highlight3.tags.definitionOperator,
  "MatchOp CompareOp": import_highlight3.tags.compareOperator,
  "ChildOp SiblingOp, LogicOp": import_highlight3.tags.logicOperator,
  BinOp: import_highlight3.tags.arithmeticOperator,
  Important: import_highlight3.tags.modifier,
  Comment: import_highlight3.tags.blockComment,
  ColorLiteral: import_highlight3.tags.color,
  "ParenthesizedContent StringLiteral": import_highlight3.tags.string,
  ":": import_highlight3.tags.punctuation,
  "PseudoOp #": import_highlight3.tags.derefOperator,
  "; , |": import_highlight3.tags.separator,
  "( )": import_highlight3.tags.paren,
  "[ ]": import_highlight3.tags.squareBracket,
  "{ }": import_highlight3.tags.brace
});
var spec_callee = { __proto__: null, lang: 44, "nth-child": 44, "nth-last-child": 44, "nth-of-type": 44, "nth-last-of-type": 44, dir: 44, "host-context": 44, if: 90, url: 132, "url-prefix": 132, domain: 132, regexp: 132 };
var spec_queryIdentifier = { __proto__: null, or: 104, and: 104, not: 112, only: 112, layer: 186 };
var spec_QueryCallee = { __proto__: null, selector: 118, layer: 182 };
var spec_AtKeyword = { __proto__: null, "@import": 178, "@media": 190, "@charset": 194, "@namespace": 198, "@keyframes": 204, "@supports": 216, "@scope": 220, "@font-feature-values": 226 };
var spec_identifier = { __proto__: null, to: 223 };
var parser3 = import_lr2.LRParser.deserialize({
  version: 14,
  states: "IpQYQdOOO#}QdOOP$UO`OOO%OQaO'#CfOOQP'#Ce'#CeO%VQdO'#CgO%[Q`O'#CgO%aQaO'#FdO&XQdO'#CkO&xQaO'#CcO'SQdO'#CnO'_QdO'#DtO'dQdO'#DvO'oQdO'#D}O'oQdO'#EQOOQP'#Fd'#FdO)OQhO'#EsOOQS'#Fc'#FcOOQS'#Ev'#EvQYQdOOO)VQdO'#EWO*cQhO'#E^O)VQdO'#E`O*jQdO'#EbO*uQdO'#EeO)zQhO'#EkO*}QdO'#EmO+YQdO'#EpO+_QaO'#CfO+fQ`O'#ETO+kQ`O'#FnO+vQdO'#FnQOQ`OOP,QO&jO'#CaPOOO)CAR)CAROOQP'#Ci'#CiOOQP,59R,59RO%VQdO,59ROOQP'#Cm'#CmOOQP,59V,59VO&XQdO,59VO,]QdO,59YO'_QdO,5:`O'dQdO,5:bO'oQdO,5:iO'oQdO,5:kO'oQdO,5:lO'oQdO'#E}O,hQ`O,58}O,pQdO'#ESOOQS,58},58}OOQP'#Cq'#CqOOQO'#Dr'#DrOOQP,59Y,59YO,wQ`O,59YO,|Q`O,59YOOQP'#Du'#DuOOQP,5:`,5:`O-RQpO'#DwO-^QdO'#DxO-cQ`O'#DxO-hQpO,5:bO.RQaO,5:iO.iQaO,5:lOOQW'#D^'#D^O/eQhO'#DgO/xQhO,5;_O)zQhO'#DeO0VQ`O'#DkO0[QhO'#DnOOQW'#Fj'#FjOOQS,5;_,5;_O0aQ`O'#DhOOQS-E8t-E8tOOQ['#Cv'#CvO0fQdO'#CwO0|QdO'#C}O1dQdO'#DQO1zQ!pO'#DSO4TQ!jO,5:rOOQO'#DX'#DXO,|Q`O'#DWO4eQ!nO'#FgO6hQ`O'#DYO6mQ`O'#DoOOQ['#Fg'#FgO6rQhO'#FqO7QQ`O,5:xO7VQ!bO,5:zOOQS'#Ed'#EdO7_Q`O,5:|O7dQdO,5:|OOQO'#Eg'#EgO7lQ`O,5;PO7qQhO,5;VO'oQdO'#DjOOQS,5;X,5;XO0aQ`O,5;XO7yQdO,5;XOOQS'#FU'#FUO8RQdO'#ErO7QQ`O,5;[O8ZQdO,5:oO8kQdO'#FPO8xQ`O,5<YO8xQ`O,5<YPOOO'#Eu'#EuP9TO&jO,58{POOO,58{,58{OOQP1G.m1G.mOOQP1G.q1G.qOOQP1G.t1G.tO,wQ`O1G.tO,|Q`O1G.tOOQP1G/z1G/zO9`QpO1G/|O9hQaO1G0TO:OQaO1G0VO:fQaO1G0WO:|QaO,5;iOOQO-E8{-E8{OOQS1G.i1G.iO;WQ`O,5:nO;]QdO'#DsO;dQdO'#CuOOQO'#Dz'#DzOOQO,5:d,5:dO-^QdO,5:dOOQP1G/|1G/|O)VQdO1G/|O;kQ!jO'#D^O;yQ!bO,59yO<RQhO,5:ROOQO'#Fk'#FkO;|Q!bO,59}O<ZQhO'#FVO)zQhO,59{O)zQhO'#FVO=OQhO1G0yOOQS1G0y1G0yO=YQhO,5:PO>QQhO'#DlOOQW,5:V,5:VOOQW,5:Y,5:YOOQW,5:S,5:SO>[Q!fO'#FhOOQS'#Fh'#FhOOQS'#Ex'#ExO?lQdO,59cOOQ[,59c,59cO@SQdO,59iOOQ[,59i,59iO@jQdO,59lOOQ[,59l,59lOOQ[,59n,59nO)VQdO,59pOAQQhO'#EYOOQW'#EY'#EYOAlQ`O1G0^O4^QhO1G0^OOQ[,59r,59rO)zQhO'#D[OOQ[,59t,59tOAqQ#tO,5:ZOA|QhO'#FROBZQ`O,5<]OOQS1G0d1G0dOOQS1G0f1G0fOOQS1G0h1G0hOBfQ`O1G0hOBkQdO'#EhOOQS1G0k1G0kOOQS1G0q1G0qOBvQaO,5:UO7QQ`O1G0sOOQS1G0s1G0sO0aQ`O1G0sOOQS-E9S-E9SOOQS1G0v1G0vOB}Q!fO1G0ZOCeQ`O'#EVOOQO1G0Z1G0ZOOQO,5;k,5;kOCjQdO,5;kOOQO-E8}-E8}OCwQ`O1G1tPOOO-E8s-E8sPOOO1G.g1G.gOOQP7+$`7+$`OOQP7+%h7+%hO)VQdO7+%hOOQS1G0Y1G0YODSQaO'#FmOD^Q`O,5:_ODcQ!fO'#EwOEaQdO'#FfOEkQ`O,59aOOQO1G0O1G0OOEpQ!bO7+%hO)VQdO1G/eOE{QhO1G/iOOQW1G/m1G/mOOQW1G/g1G/gOF^QhO,5;qOOQW-E9T-E9TOOQS7+&e7+&eOGRQhO'#D^OGaQhO'#FlOGlQ`O'#FlOGqQ`O,5:WOOQS-E8v-E8vOOQ[1G.}1G.}OOQ[1G/T1G/TOOQ[1G/W1G/WOOQ[1G/[1G/[OGvQdO,5:tOOQS7+%x7+%xOG{Q`O7+%xOHQQhO'#D]OHYQ`O,59vO)zQhO,59vOOQ[1G/u1G/uOHbQ`O1G/uOHgQhO,5;mOOQO-E9P-E9POOQS7+&S7+&SOHuQbO'#DSOOQO'#Ej'#EjOITQ`O'#EiOOQO'#Ei'#EiOI`Q`O'#FSOIhQdO,5;SOOQS,5;S,5;SOOQ[1G/p1G/pOOQS7+&_7+&_O7QQ`O7+&_OIsQ!fO'#FOO)VQdO'#FOOJzQdO7+%uOOQO7+%u7+%uOOQO,5:q,5:qOOQO1G1V1G1VOK_Q!bO<<ISOKjQdO'#E|OKtQ`O,5<XOOQP1G/y1G/yOOQS-E8u-E8uOK|QdO'#E{OLWQ`O,5<QOOQ]1G.{1G.{OOQP<<IS<<ISOL`Q`O<<ISOLeQdO7+%POOQO'#D`'#D`OLlQ!bO7+%TOLtQhO'#EzOMRQ`O,5<WO)VQdO,5<WOOQW1G/r1G/rOOQO'#E['#E[OMZQ`O1G0`OOQS<<Id<<IdO)VQdO,59wOMzQhO1G/bOOQ[1G/b1G/bONRQ`O1G/bOOQW-E8w-E8wOOQ[7+%a7+%aOOQO,5;T,5;TOBnQdO'#FTOI`Q`O,5;nOOQS,5;n,5;nOOQS-E9Q-E9QOOQS1G0n1G0nOOQS<<Iy<<IyONZQ!fO,5;jOOQS-E8|-E8|OOQO<<Ia<<IaOOQPAN>nAN>nO! bQ`OAN>nO! gQaO,5;hOOQO-E8z-E8zO! qQdO,5;gOOQO-E8y-E8yOOQW<<Hk<<HkOOQW<<Ho<<HoO! {QhO<<HoO!!^QhO,5;fO!!iQ`O,5;fOOQO-E8x-E8xO!!nQdO1G1rOGvQdO'#FQO!!xQ`O7+%zOOQW7+%z7+%zO!#QQ!bO1G/cOOQ[7+$|7+$|O!#]QhO7+$|P!#dQ`O'#EyOOQO,5;o,5;oOOQO-E9R-E9ROOQS1G1Y1G1YOOQPG24YG24YO!#iQ`OAN>ZO)VQdO1G1QO!#nQ`O7+'^OOQO,5;l,5;lOOQO-E9O-E9OOOQW<<If<<IfOOQ[<<Hh<<HhPOQW,5;e,5;eOOQWG23uG23uO!#vQdO7+&l",
  stateData: "!$Z~O$QOS$RQQ~OWVO^_O`WOcYOdYOl`OmZOp[O!r]O!u^O!{dO#ReO#TfO#VgO#YhO#`iO#bjO#ekO#|RO$XTO~OQmOWVO^_O`WOcYOdYOl`OmZOp[O!r]O!u^O!{dO#ReO#TfO#VgO#YhO#`iO#bjO#ekO#|lO$XTO~O#z$bP~P!jO$RqO~O`YXcYXdYXmYXpYXsYX!aYX!rYX!uYX#{YX$X[X~OgYX~P$ZO#|sO~O$XuO~O$XuO`$WXc$WXd$WXm$WXp$WXs$WX!a$WX!r$WX!u$WX#{$WXg$WX~O#|vO~O`xOcyOdyOmzOp{O!r|O!u!OO#{}O~Os!RO!a!PO~P&^Of!XO#|!TO#}!UO~O#|!YO~OW!^O#|![O$X!]O~OWVO^_O`WOcYOdYOmZOp[O!r]O!u^O#|RO$XTO~OS!fOc!gOd!gOh!cOs!RO!Y!eO!]!jO$O!bO~On!iO~P(dOQ!tOh!mOp!nOs!oOu!wOw!wO}!uO!d!vO#|!lO#}!rO$]!pO~OS!fOc!gOd!gOh!cO!Y!eO!]!jO$O!bO~Os$eP~P)zOw!|O!d!vO#|!{O~Ow#OO#|#OO~Oh#ROs!RO#c#TO~O#|#VO~Oc!xX~P$ZOc#YO~On#ZO#z$bXr$bX~O#z$bXr$bX~P!jO$S#^O$T#^O$U#`O~Of#eO#|!TO#}!UO~Os!RO!a!PO~Or$bP~P!jOh#oO~Oh#pO~Oo!kX!o!kX$X!mX~O#|#qO~O$X#sO~Oo#tO!o#uO~O`xOcyOdyOmzOp{O~Os!qa!a!qa!r!qa!u!qa#{!qag!qa~P-pOs!ta!a!ta!r!ta!u!ta#{!tag!ta~P-pOS!fOc!gOd!gOh!cO!Y!eO!]!jO~OR#yOu#yOw#yO$O#vO$]!pO~P/POn$PO!U#|O!a#}O~P(dOh$RO~O$O$TO~Oh#RO~O`$WOc$WOg$ZOl$WOm$WOn$WO~P)VO`$WOc$WOl$WOm$WOn$WOo$]O~P)VO`$WOc$WOl$WOm$WOn$WOr$_O~P)VOP$`OSvXcvXdvXhvXnvXyvX!YvX!]vX!}vX#PvX$OvX!WvXQvX`vXgvXlvXmvXpvXsvXuvXwvX}vX!dvX#|vX#}vX$]vXovXrvX!avX#zvX$dvX!pvX~Oy$aO!}$bO#P$cOn$eP~P)zOh#pOS$ZXc$ZXd$ZXn$ZXy$ZX!Y$ZX!]$ZX!}$ZX#P$ZX$O$ZXQ$ZX`$ZXg$ZXl$ZXm$ZXp$ZXs$ZXu$ZXw$ZX}$ZX!d$ZX#|$ZX#}$ZX$]$ZXo$ZXr$ZX!a$ZX#z$ZX$d$ZX!p$ZX~Oh$gO~Oh$iO~O!U#|O!a$jOs$eXn$eX~Os!RO~On$mOy$aO~On$nO~Ow$oO!d!vO~Os$pO~Os!RO!U#|O~Os!RO#c$vO~O#|#VOs#fX~O$d$zOn!wa#z!war!wa~P)VOn#sX#z#sXr#sX~P!jOn#ZO#z$bar$ba~O$S#^O$T#^O$U%RO~Oo%TO!o%UO~Os!qi!a!qi!r!qi!u!qi#{!qig!qi~P-pOs!si!a!si!r!si!u!si#{!sig!si~P-pOs!ti!a!ti!r!ti!u!ti#{!tig!ti~P-pOs#qa!a#qa~P&^Or%VO~Og$aP~P'oOg$YP~P)VOc!SXg!QX!U!QX!W!SX~Oc%_O!W%`O~Og%aO!U#|O~O!U#|OS#yXc#yXd#yXh#yXn#yXs#yX!Y#yX!]#yX!a#yX$O#yX~On%eO!a#}O~P(dO!U#|OS!Xac!Xad!Xah!Xan!Xas!Xa!Y!Xa!]!Xa!a!Xa$O!Xag!Xa~O$O%fOg$`P~P/POy$aOQ$[X`$[Xc$[Xg$[Xh$[Xl$[Xm$[Xn$[Xp$[Xs$[Xu$[Xw$[X}$[X!d$[X#|$[X#}$[X$]$[Xo$[Xr$[X~O`$WOc$WOg%kOl$WOm$WOn$WO~P)VO`$WOc$WOl$WOm$WOn$WOo%lO~P)VO`$WOc$WOl$WOm$WOn$WOr%mO~P)VOh%oOS!|Xc!|Xd!|Xn!|X!Y!|X!]!|X$O!|X~On%pO~Og%uOw%vO!e%vO~Os#uX!a#uXn#uX~P)zO!a$jOs$ean$ea~On%yO~Or&QO#|%{O$]%zO~Og&RO~P&^Oy$aO!a&VO$d$zOn!wi#z!wir!wi~P)VO$c&YO~On#sa#z#sar#sa~P!jOn#ZO#z$bir$bi~O!a&]Og$aX~P&^Og&_O~Oy$aOQ#kXg#kXh#kXp#kXs#kXu#kXw#kX}#kX!a#kX!d#kX#|#kX#}#kX$]#kX~O!a&aOg$YX~P)VOg&cO~Oo&dOy$aO!p&eO~OR#yOu#yOw#yO$O&gO$]!pO~O!U#|OS#yac#yad#yah#yan#yas#ya!Y#ya!]#ya!a#ya$O#ya~Oc!SXg!QX!U!QX!a!QX~O!U#|O!a&iOg$`X~Oc&kO~Og&lO~O#|&mO~On&oO~Oc&pO!U#|O~Og&rOn&qO~Og&uO~O!U#|Os#ua!a#uan#ua~OP$`OsvX!avXgvX~O$]%zOs#]X!a#]X~Os!RO!a&wO~Or&{O#|%{O$]%zO~Oy$aOQ#rXh#rXn#rXp#rXs#rXu#rXw#rX}#rX!a#rX!d#rX#z#rX#|#rX#}#rX$]#rX$d#rXr#rX~O!a&VO$d$zOn!wq#z!wqr!wq~P)VOo'QOy$aO!p'RO~Og#pX!a#pX~P'oO!a&]Og$aa~Og#oX!a#oX~P)VO!a&aOg$Ya~Oo'QO~Og'WO~P)VOg'XO!W'YO~O$O%fOg#nX!a#nX~P/PO!a&iOg$`a~O`'_Og'aO~OS#mac#mad#mah#ma!Y#ma!]#ma$O#ma~Og'cO~PMcOg'cOn'dO~Oy$aOQ#rah#ran#rap#ras#rau#raw#ra}#ra!a#ra!d#ra#z#ra#|#ra#}#ra$]#ra$d#rar#ra~Oo'iO~Og#pa!a#pa~P&^Og#oa!a#oa~P)VOR#yOu#yOw#yO$O&gO$]%zO~O!U#|Og#na!a#na~Oc'kO~O!a&iOg$`i~P)VO`'_Og'oO~Oy$aOg!Pin!Pi~Og'pO~PMcOn'qO~Og'rO~O!a&iOg$`q~Og#nq!a#nq~P)VO$Q!e$R$]`$]y!u~",
  goto: "4h$fPPPPP$gP$jP$s%V$s%i%{P$sP&R$sPP&XPPP&_&i&iPPPPP&iPP&iP'VP&iP&i(Q&iP(n(q(w(w)Z(wP(wP(wP(w(wP)j(w)vP(w)yPP*m*s$s*y$s+P+P+V+ZPP$sP$s$sP+a,],j,q$jP,zP,}P$jP$jP$jP-T$jP-W-Z-^-e$jP$jPP$jP-j$jP-m-s.S.j.x/O/Y/`/f/l/r/|0S0Y0`0f0lPPPPPPPPPPP0r0{P1q1t2vP3O3x4R4U4XPP4_RrQ_aOPco!R#Z$}q_OP]^co|}!O!P!R#R#Z#o$}&]qSOP]^co|}!O!P!R#R#Z#o$}&]qUOP]^co|}!O!P!R#R#Z#o$}&]QtTR#auQwWR#bxQ!VYR#cyQ#c!XS$f!s!tR%S#e!V!wdf!m!n!o#Y#p#u$Y$[$^$a$y%U%Z%_&V&W&a&f&k&p'U'^'k's!U!wdf!m!n!o#Y#p#u$Y$[$^$a$y%U%Z%_&V&W&a&f&k&p'U'^'k'sU#y!c%`'YU%}$p&P&wR&v%|!V!sdf!m!n!o#Y#p#u$Y$[$^$a$y%U%Z%_&V&W&a&f&k&p'U'^'k'sR$h!uQ%s$gR&s%tq!h`ei!c!d!e!q#|#}$O$R$e$g$j%t&iQ#w!cQ%h$RQ&h%`Q'[&iR'j'YQ#UjQ$U!jQ$t#TR&T$vR$S!f!U!wdf!m!n!o#Y#p#u$Y$[$^$a$y%U%Z%_&V&W&a&f&k&p'U'^'k'sQ!|gR$o!}Q!WYR#dyQ#c!WR%S#dQ!ZZR#fzQ!_[R#g{T!^[{Q#r!]R%]#sQ!SXQ!i`Q#SjQ#m!QQ$P!dQ$l!yQ$r#QQ$u#UQ$x#XQ%e$OQ&S$tQ&y&OQ&|&TR'h&xSnP!RQ#]oQ$|#ZR&Z$}ZmPo!R#Z$}Q${#YQ&X$yR'P&WR$e!qQ&n%oR'm'_R!}gR#PhR$q#PS&O$p&PR'f&wV%|$p&P&wR#XkQ#_qR%Q#_QcOSoP!RU!kco$}R$}#ZQ%Z#pY&`%Z&f'U'^'sQ&f%_Q'U&aQ'^&kR's'kQ$Y!mQ$[!nQ$^!oV%j$Y$[$^Q%t$gR&t%tQ&j%gS']&j'lR'l'^Q&b%ZR'V&bQ&^%WR'T&^Q!QXR#l!QQ&W$yR'O&WQ#[nS%O#[%PR%P#]Q'`&nR'n'`Q$k!xR%x$kQ&P$pR&z&PQ&x&OR'g&xQ#WkR$w#WQ$O!dR%d$O_bOPco!R#Z$}^XOPco!R#Z$}Q!`]Q!a^Q#h|Q#i}Q#j!OQ#k!PQ$s#RQ%W#oR'S&]R%[#pQ!qdQ!zf[$V!m!n!o$Y$[$^Q$y#Yd%Y#p%Z%_&a&f&k'U'^'k'sQ%^#uQ%n$aS&U$y&WQ&[%UQ&}&VR'b&p]$X!m!n!o$Y$[$^Q!d`U!xe!q$eQ#QiQ#x!cS#{!d$OQ$Q!eQ%b#|Q%c#}Q%g$RS%r$g%tQ%w$jR'Z&iQ#z!cQ&h%`R'j'YR%i$RR%X#oQpPR#n!RQ!yeQ$d!qR%q$e",
  nodeNames: "\u26A0 Unit VariableName VariableName QueryCallee Comment StyleSheet RuleSet UniversalSelector TagSelector TagName NamespacedTagSelector NamespaceName TagName NestingSelector ClassSelector . ClassName PseudoClassSelector : :: PseudoClassName PseudoClassName ) ( ArgList ValueName ParenthesizedValue AtKeyword # ; ] [ BracketedValue } { BracedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp CallExpression Callee IfExpression if ArgList IfBranch KeywordQuery FeatureQuery FeatureName BinaryQuery LogicOp ComparisonQuery CompareOp UnaryQuery UnaryQueryOp ParenthesizedQuery SelectorQuery selector ParenthesizedSelector CallQuery ArgList , PseudoQuery CallLiteral CallTag ParenthesizedContent PseudoClassName ArgList IdSelector IdName AttributeSelector AttributeName NamespacedAttribute NamespaceName AttributeName MatchOp MatchFlag ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp Block Declaration PropertyName Important ImportStatement import Layer layer LayerName layer MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList KeyframeSelector KeyframeRangeName SupportsStatement supports ScopeStatement scope to FontFeatureStatement font-feature-values FontName AtRule Styles",
  maxTerm: 159,
  nodeProps: [
    ["isolate", -2, 5, 39, ""],
    ["openedBy", 23, "(", 31, "[", 34, "{"],
    ["closedBy", 24, ")", 32, "]", 35, "}"]
  ],
  propSources: [cssHighlighting],
  skippedNodes: [0, 5, 117],
  repeatNodeCount: 17,
  tokenData: "K`~R!bOX%ZX^&R^p%Zpq&Rqr)ers)vst+jtu2Xuv%Zvw3Rwx3dxy5Ryz5dz{5i{|6S|}:u}!O;W!O!P;u!P!Q<^!Q![=V![!]>Q!]!^>|!^!_?_!_!`@Z!`!a@n!a!b%Z!b!cAo!c!k%Z!k!lC|!l!u%Z!u!vC|!v!}%Z!}#OD_#O#P%Z#P#QDp#Q#R2X#R#]%Z#]#^ER#^#g%Z#g#hC|#h#o%Z#o#pIf#p#qIw#q#rJ`#r#sJq#s#y%Z#y#z&R#z$f%Z$f$g&R$g#BY%Z#BY#BZ&R#BZ$IS%Z$IS$I_&R$I_$I|%Z$I|$JO&R$JO$JT%Z$JT$JU&R$JU$KV%Z$KV$KW&R$KW&FU%Z&FU&FV&R&FV;'S%Z;'S;=`KY<%lO%Z`%^SOy%jz;'S%j;'S;=`%{<%lO%j`%oS!e`Oy%jz;'S%j;'S;=`%{<%lO%j`&OP;=`<%l%j~&Wh$Q~OX%jX^'r^p%jpq'rqy%jz#y%j#y#z'r#z$f%j$f$g'r$g#BY%j#BY#BZ'r#BZ$IS%j$IS$I_'r$I_$I|%j$I|$JO'r$JO$JT%j$JT$JU'r$JU$KV%j$KV$KW'r$KW&FU%j&FU&FV'r&FV;'S%j;'S;=`%{<%lO%j~'yh$Q~!e`OX%jX^'r^p%jpq'rqy%jz#y%j#y#z'r#z$f%j$f$g'r$g#BY%j#BY#BZ'r#BZ$IS%j$IS$I_'r$I_$I|%j$I|$JO'r$JO$JT%j$JT$JU'r$JU$KV%j$KV$KW'r$KW&FU%j&FU&FV'r&FV;'S%j;'S;=`%{<%lO%jj)jS$dYOy%jz;'S%j;'S;=`%{<%lO%j~)yWOY)vZr)vrs*cs#O)v#O#P*h#P;'S)v;'S;=`+d<%lO)v~*hOw~~*kRO;'S)v;'S;=`*t;=`O)v~*wXOY)vZr)vrs*cs#O)v#O#P*h#P;'S)v;'S;=`+d;=`<%l)v<%lO)v~+gP;=`<%l)vj+oYmYOy%jz!Q%j!Q![,_![!c%j!c!i,_!i#T%j#T#Z,_#Z;'S%j;'S;=`%{<%lO%jj,dY!e`Oy%jz!Q%j!Q![-S![!c%j!c!i-S!i#T%j#T#Z-S#Z;'S%j;'S;=`%{<%lO%jj-XY!e`Oy%jz!Q%j!Q![-w![!c%j!c!i-w!i#T%j#T#Z-w#Z;'S%j;'S;=`%{<%lO%jj.OYuY!e`Oy%jz!Q%j!Q![.n![!c%j!c!i.n!i#T%j#T#Z.n#Z;'S%j;'S;=`%{<%lO%jj.uYuY!e`Oy%jz!Q%j!Q![/e![!c%j!c!i/e!i#T%j#T#Z/e#Z;'S%j;'S;=`%{<%lO%jj/jY!e`Oy%jz!Q%j!Q![0Y![!c%j!c!i0Y!i#T%j#T#Z0Y#Z;'S%j;'S;=`%{<%lO%jj0aYuY!e`Oy%jz!Q%j!Q![1P![!c%j!c!i1P!i#T%j#T#Z1P#Z;'S%j;'S;=`%{<%lO%jj1UY!e`Oy%jz!Q%j!Q![1t![!c%j!c!i1t!i#T%j#T#Z1t#Z;'S%j;'S;=`%{<%lO%jj1{SuY!e`Oy%jz;'S%j;'S;=`%{<%lO%jd2[UOy%jz!_%j!_!`2n!`;'S%j;'S;=`%{<%lO%jd2uS!oS!e`Oy%jz;'S%j;'S;=`%{<%lO%jb3WS^QOy%jz;'S%j;'S;=`%{<%lO%j~3gWOY3dZw3dwx*cx#O3d#O#P4P#P;'S3d;'S;=`4{<%lO3d~4SRO;'S3d;'S;=`4];=`O3d~4`XOY3dZw3dwx*cx#O3d#O#P4P#P;'S3d;'S;=`4{;=`<%l3d<%lO3d~5OP;=`<%l3dj5WShYOy%jz;'S%j;'S;=`%{<%lO%j~5iOg~n5pUWQyWOy%jz!_%j!_!`2n!`;'S%j;'S;=`%{<%lO%jj6ZWyW!uQOy%jz!O%j!O!P6s!P!Q%j!Q![9x![;'S%j;'S;=`%{<%lO%jj6xU!e`Oy%jz!Q%j!Q![7[![;'S%j;'S;=`%{<%lO%jj7cY!e`$]YOy%jz!Q%j!Q![7[![!g%j!g!h8R!h#X%j#X#Y8R#Y;'S%j;'S;=`%{<%lO%jj8WY!e`Oy%jz{%j{|8v|}%j}!O8v!O!Q%j!Q![9_![;'S%j;'S;=`%{<%lO%jj8{U!e`Oy%jz!Q%j!Q![9_![;'S%j;'S;=`%{<%lO%jj9fU!e`$]YOy%jz!Q%j!Q![9_![;'S%j;'S;=`%{<%lO%jj:P[!e`$]YOy%jz!O%j!O!P7[!P!Q%j!Q![9x![!g%j!g!h8R!h#X%j#X#Y8R#Y;'S%j;'S;=`%{<%lO%jj:zS!aYOy%jz;'S%j;'S;=`%{<%lO%jj;]WyWOy%jz!O%j!O!P6s!P!Q%j!Q![9x![;'S%j;'S;=`%{<%lO%jj;zU`YOy%jz!Q%j!Q![7[![;'S%j;'S;=`%{<%lO%j~<cTyWOy%jz{<r{;'S%j;'S;=`%{<%lO%j~<yS!e`$R~Oy%jz;'S%j;'S;=`%{<%lO%jj=[[$]YOy%jz!O%j!O!P7[!P!Q%j!Q![9x![!g%j!g!h8R!h#X%j#X#Y8R#Y;'S%j;'S;=`%{<%lO%jj>VUcYOy%jz![%j![!]>i!];'S%j;'S;=`%{<%lO%jj>pSdY!e`Oy%jz;'S%j;'S;=`%{<%lO%jj?RSnYOy%jz;'S%j;'S;=`%{<%lO%jh?dU!WWOy%jz!_%j!_!`?v!`;'S%j;'S;=`%{<%lO%jh?}S!WW!e`Oy%jz;'S%j;'S;=`%{<%lO%jl@bS!WW!oSOy%jz;'S%j;'S;=`%{<%lO%jj@uV!rQ!WWOy%jz!_%j!_!`?v!`!aA[!a;'S%j;'S;=`%{<%lO%jbAcS!rQ!e`Oy%jz;'S%j;'S;=`%{<%lO%jjArYOy%jz}%j}!OBb!O!c%j!c!}CP!}#T%j#T#oCP#o;'S%j;'S;=`%{<%lO%jjBgW!e`Oy%jz!c%j!c!}CP!}#T%j#T#oCP#o;'S%j;'S;=`%{<%lO%jjCW[lY!e`Oy%jz}%j}!OCP!O!Q%j!Q![CP![!c%j!c!}CP!}#T%j#T#oCP#o;'S%j;'S;=`%{<%lO%jhDRS!pWOy%jz;'S%j;'S;=`%{<%lO%jjDdSpYOy%jz;'S%j;'S;=`%{<%lO%jnDuSo^Oy%jz;'S%j;'S;=`%{<%lO%jjEWU!pWOy%jz#a%j#a#bEj#b;'S%j;'S;=`%{<%lO%jbEoU!e`Oy%jz#d%j#d#eFR#e;'S%j;'S;=`%{<%lO%jbFWU!e`Oy%jz#c%j#c#dFj#d;'S%j;'S;=`%{<%lO%jbFoU!e`Oy%jz#f%j#f#gGR#g;'S%j;'S;=`%{<%lO%jbGWU!e`Oy%jz#h%j#h#iGj#i;'S%j;'S;=`%{<%lO%jbGoU!e`Oy%jz#T%j#T#UHR#U;'S%j;'S;=`%{<%lO%jbHWU!e`Oy%jz#b%j#b#cHj#c;'S%j;'S;=`%{<%lO%jbHoU!e`Oy%jz#h%j#h#iIR#i;'S%j;'S;=`%{<%lO%jbIYS$cQ!e`Oy%jz;'S%j;'S;=`%{<%lO%jjIkSsYOy%jz;'S%j;'S;=`%{<%lO%jfI|U$XUOy%jz!_%j!_!`2n!`;'S%j;'S;=`%{<%lO%jjJeSrYOy%jz;'S%j;'S;=`%{<%lO%jfJvU!uQOy%jz!_%j!_!`2n!`;'S%j;'S;=`%{<%lO%j`K]P;=`<%l%Z",
  tokenizers: [descendant, unitToken, identifiers, queryIdentifiers, 1, 2, 3, 4, new import_lr2.LocalTokenGroup("m~RRYZ[z{a~~g~aO$T~~dP!P!Qg~lO$U~~", 28, 142)],
  topRules: { "StyleSheet": [0, 6], "Styles": [1, 116] },
  dynamicPrecedences: { "84": 1 },
  specialized: [{ term: 137, get: (value) => spec_callee[value] || -1 }, { term: 138, get: (value) => spec_queryIdentifier[value] || -1 }, { term: 4, get: (value) => spec_QueryCallee[value] || -1 }, { term: 28, get: (value) => spec_AtKeyword[value] || -1 }, { term: 136, get: (value) => spec_identifier[value] || -1 }],
  tokenPrec: 2256
});

// node_modules/@codemirror/lang-css/dist/index.js
var import_language = require("@codemirror/language");
var import_common3 = require("@lezer/common");
var _properties = null;
function properties() {
  if (!_properties && typeof document == "object" && document.body) {
    let { style } = document.body, names = [], seen = /* @__PURE__ */ new Set();
    for (let prop in style)
      if (prop != "cssText" && prop != "cssFloat") {
        if (typeof style[prop] == "string") {
          if (/[A-Z]/.test(prop))
            prop = prop.replace(/[A-Z]/g, (ch) => "-" + ch.toLowerCase());
          if (!seen.has(prop)) {
            names.push(prop);
            seen.add(prop);
          }
        }
      }
    _properties = names.sort().map((name) => ({ type: "property", label: name, apply: name + ": " }));
  }
  return _properties || [];
}
var pseudoClasses = /* @__PURE__ */ [
  "active",
  "after",
  "any-link",
  "autofill",
  "backdrop",
  "before",
  "checked",
  "cue",
  "default",
  "defined",
  "disabled",
  "empty",
  "enabled",
  "file-selector-button",
  "first",
  "first-child",
  "first-letter",
  "first-line",
  "first-of-type",
  "focus",
  "focus-visible",
  "focus-within",
  "fullscreen",
  "has",
  "host",
  "host-context",
  "hover",
  "in-range",
  "indeterminate",
  "invalid",
  "is",
  "lang",
  "last-child",
  "last-of-type",
  "left",
  "link",
  "marker",
  "modal",
  "not",
  "nth-child",
  "nth-last-child",
  "nth-last-of-type",
  "nth-of-type",
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "part",
  "placeholder",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "selection",
  "slotted",
  "target",
  "target-text",
  "valid",
  "visited",
  "where"
].map((name) => ({ type: "class", label: name }));
var values = /* @__PURE__ */ [
  "above",
  "absolute",
  "activeborder",
  "additive",
  "activecaption",
  "after-white-space",
  "ahead",
  "alias",
  "all",
  "all-scroll",
  "alphabetic",
  "alternate",
  "always",
  "antialiased",
  "appworkspace",
  "asterisks",
  "attr",
  "auto",
  "auto-flow",
  "avoid",
  "avoid-column",
  "avoid-page",
  "avoid-region",
  "axis-pan",
  "background",
  "backwards",
  "baseline",
  "below",
  "bidi-override",
  "blink",
  "block",
  "block-axis",
  "bold",
  "bolder",
  "border",
  "border-box",
  "both",
  "bottom",
  "break",
  "break-all",
  "break-word",
  "bullets",
  "button",
  "button-bevel",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "calc",
  "capitalize",
  "caps-lock-indicator",
  "caption",
  "captiontext",
  "caret",
  "cell",
  "center",
  "checkbox",
  "circle",
  "cjk-decimal",
  "clear",
  "clip",
  "close-quote",
  "col-resize",
  "collapse",
  "color",
  "color-burn",
  "color-dodge",
  "column",
  "column-reverse",
  "compact",
  "condensed",
  "contain",
  "content",
  "contents",
  "content-box",
  "context-menu",
  "continuous",
  "copy",
  "counter",
  "counters",
  "cover",
  "crop",
  "cross",
  "crosshair",
  "currentcolor",
  "cursive",
  "cyclic",
  "darken",
  "dashed",
  "decimal",
  "decimal-leading-zero",
  "default",
  "default-button",
  "dense",
  "destination-atop",
  "destination-in",
  "destination-out",
  "destination-over",
  "difference",
  "disc",
  "discard",
  "disclosure-closed",
  "disclosure-open",
  "document",
  "dot-dash",
  "dot-dot-dash",
  "dotted",
  "double",
  "down",
  "e-resize",
  "ease",
  "ease-in",
  "ease-in-out",
  "ease-out",
  "element",
  "ellipse",
  "ellipsis",
  "embed",
  "end",
  "ethiopic-abegede-gez",
  "ethiopic-halehame-aa-er",
  "ethiopic-halehame-gez",
  "ew-resize",
  "exclusion",
  "expanded",
  "extends",
  "extra-condensed",
  "extra-expanded",
  "fantasy",
  "fast",
  "fill",
  "fill-box",
  "fixed",
  "flat",
  "flex",
  "flex-end",
  "flex-start",
  "footnotes",
  "forwards",
  "from",
  "geometricPrecision",
  "graytext",
  "grid",
  "groove",
  "hand",
  "hard-light",
  "help",
  "hidden",
  "hide",
  "higher",
  "highlight",
  "highlighttext",
  "horizontal",
  "hsl",
  "hsla",
  "hue",
  "icon",
  "ignore",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infinite",
  "infobackground",
  "infotext",
  "inherit",
  "initial",
  "inline",
  "inline-axis",
  "inline-block",
  "inline-flex",
  "inline-grid",
  "inline-table",
  "inset",
  "inside",
  "intrinsic",
  "invert",
  "italic",
  "justify",
  "keep-all",
  "landscape",
  "large",
  "larger",
  "left",
  "level",
  "lighter",
  "lighten",
  "line-through",
  "linear",
  "linear-gradient",
  "lines",
  "list-item",
  "listbox",
  "listitem",
  "local",
  "logical",
  "loud",
  "lower",
  "lower-hexadecimal",
  "lower-latin",
  "lower-norwegian",
  "lowercase",
  "ltr",
  "luminosity",
  "manipulation",
  "match",
  "matrix",
  "matrix3d",
  "medium",
  "menu",
  "menutext",
  "message-box",
  "middle",
  "min-intrinsic",
  "mix",
  "monospace",
  "move",
  "multiple",
  "multiple_mask_images",
  "multiply",
  "n-resize",
  "narrower",
  "ne-resize",
  "nesw-resize",
  "no-close-quote",
  "no-drop",
  "no-open-quote",
  "no-repeat",
  "none",
  "normal",
  "not-allowed",
  "nowrap",
  "ns-resize",
  "numbers",
  "numeric",
  "nw-resize",
  "nwse-resize",
  "oblique",
  "opacity",
  "open-quote",
  "optimizeLegibility",
  "optimizeSpeed",
  "outset",
  "outside",
  "outside-shape",
  "overlay",
  "overline",
  "padding",
  "padding-box",
  "painted",
  "page",
  "paused",
  "perspective",
  "pinch-zoom",
  "plus-darker",
  "plus-lighter",
  "pointer",
  "polygon",
  "portrait",
  "pre",
  "pre-line",
  "pre-wrap",
  "preserve-3d",
  "progress",
  "push-button",
  "radial-gradient",
  "radio",
  "read-only",
  "read-write",
  "read-write-plaintext-only",
  "rectangle",
  "region",
  "relative",
  "repeat",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeat-x",
  "repeat-y",
  "reset",
  "reverse",
  "rgb",
  "rgba",
  "ridge",
  "right",
  "rotate",
  "rotate3d",
  "rotateX",
  "rotateY",
  "rotateZ",
  "round",
  "row",
  "row-resize",
  "row-reverse",
  "rtl",
  "run-in",
  "running",
  "s-resize",
  "sans-serif",
  "saturation",
  "scale",
  "scale3d",
  "scaleX",
  "scaleY",
  "scaleZ",
  "screen",
  "scroll",
  "scrollbar",
  "scroll-position",
  "se-resize",
  "self-start",
  "self-end",
  "semi-condensed",
  "semi-expanded",
  "separate",
  "serif",
  "show",
  "single",
  "skew",
  "skewX",
  "skewY",
  "skip-white-space",
  "slide",
  "slider-horizontal",
  "slider-vertical",
  "sliderthumb-horizontal",
  "sliderthumb-vertical",
  "slow",
  "small",
  "small-caps",
  "small-caption",
  "smaller",
  "soft-light",
  "solid",
  "source-atop",
  "source-in",
  "source-out",
  "source-over",
  "space",
  "space-around",
  "space-between",
  "space-evenly",
  "spell-out",
  "square",
  "start",
  "static",
  "status-bar",
  "stretch",
  "stroke",
  "stroke-box",
  "sub",
  "subpixel-antialiased",
  "svg_masks",
  "super",
  "sw-resize",
  "symbolic",
  "symbols",
  "system-ui",
  "table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row",
  "table-row-group",
  "text",
  "text-bottom",
  "text-top",
  "textarea",
  "textfield",
  "thick",
  "thin",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "to",
  "top",
  "transform",
  "translate",
  "translate3d",
  "translateX",
  "translateY",
  "translateZ",
  "transparent",
  "ultra-condensed",
  "ultra-expanded",
  "underline",
  "unidirectional-pan",
  "unset",
  "up",
  "upper-latin",
  "uppercase",
  "url",
  "var",
  "vertical",
  "vertical-text",
  "view-box",
  "visible",
  "visibleFill",
  "visiblePainted",
  "visibleStroke",
  "visual",
  "w-resize",
  "wait",
  "wave",
  "wider",
  "window",
  "windowframe",
  "windowtext",
  "words",
  "wrap",
  "wrap-reverse",
  "x-large",
  "x-small",
  "xor",
  "xx-large",
  "xx-small"
].map((name) => ({ type: "keyword", label: name })).concat(/* @__PURE__ */ [
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "grey",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen"
].map((name) => ({ type: "constant", label: name })));
var tags4 = /* @__PURE__ */ [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "form",
  "header",
  "hgroup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "meter",
  "nav",
  "ol",
  "output",
  "p",
  "pre",
  "ruby",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
].map((name) => ({ type: "type", label: name }));
var atRules = /* @__PURE__ */ [
  "@charset",
  "@color-profile",
  "@container",
  "@counter-style",
  "@font-face",
  "@font-feature-values",
  "@font-palette-values",
  "@import",
  "@keyframes",
  "@layer",
  "@media",
  "@namespace",
  "@page",
  "@position-try",
  "@property",
  "@scope",
  "@starting-style",
  "@supports",
  "@view-transition"
].map((label) => ({ type: "keyword", label }));
var identifier2 = /^(\w[\w-]*|-\w[\w-]*|)$/;
var variable = /^-(-[\w-]*)?$/;
function isVarArg(node, doc) {
  var _a;
  if (node.name == "(" || node.type.isError)
    node = node.parent || node;
  if (node.name != "ArgList")
    return false;
  let callee2 = (_a = node.parent) === null || _a === void 0 ? void 0 : _a.firstChild;
  if ((callee2 === null || callee2 === void 0 ? void 0 : callee2.name) != "Callee")
    return false;
  return doc.sliceString(callee2.from, callee2.to) == "var";
}
var VariablesByNode = /* @__PURE__ */ new import_common3.NodeWeakMap();
var declSelector = ["Declaration"];
function astTop(node) {
  for (let cur = node; ; ) {
    if (cur.type.isTop)
      return cur;
    if (!(cur = cur.parent))
      return node;
  }
}
function variableNames(doc, node, isVariable) {
  if (node.to - node.from > 4096) {
    let known = VariablesByNode.get(node);
    if (known)
      return known;
    let result = [], seen = /* @__PURE__ */ new Set(), cursor = node.cursor(import_common3.IterMode.IncludeAnonymous);
    if (cursor.firstChild())
      do {
        for (let option of variableNames(doc, cursor.node, isVariable))
          if (!seen.has(option.label)) {
            seen.add(option.label);
            result.push(option);
          }
      } while (cursor.nextSibling());
    VariablesByNode.set(node, result);
    return result;
  } else {
    let result = [], seen = /* @__PURE__ */ new Set();
    node.cursor().iterate((node2) => {
      var _a;
      if (isVariable(node2) && node2.matchContext(declSelector) && ((_a = node2.node.nextSibling) === null || _a === void 0 ? void 0 : _a.name) == ":") {
        let name = doc.sliceString(node2.from, node2.to);
        if (!seen.has(name)) {
          seen.add(name);
          result.push({ label: name, type: "variable" });
        }
      }
    });
    return result;
  }
}
var defineCSSCompletionSource = (isVariable) => (context) => {
  let { state, pos } = context, node = (0, import_language.syntaxTree)(state).resolveInner(pos, -1);
  let isDash = node.type.isError && node.from == node.to - 1 && state.doc.sliceString(node.from, node.to) == "-";
  if (node.name == "PropertyName" || (isDash || node.name == "TagName") && /^(Block|Styles)$/.test(node.resolve(node.to).name))
    return { from: node.from, options: properties(), validFor: identifier2 };
  if (node.name == "ValueName")
    return { from: node.from, options: values, validFor: identifier2 };
  if (node.name == "PseudoClassName")
    return { from: node.from, options: pseudoClasses, validFor: identifier2 };
  if (isVariable(node) || (context.explicit || isDash) && isVarArg(node, state.doc))
    return {
      from: isVariable(node) || isDash ? node.from : pos,
      options: variableNames(state.doc, astTop(node), isVariable),
      validFor: variable
    };
  if (node.name == "TagName") {
    for (let { parent } = node; parent; parent = parent.parent)
      if (parent.name == "Block")
        return { from: node.from, options: properties(), validFor: identifier2 };
    return { from: node.from, options: tags4, validFor: identifier2 };
  }
  if (node.name == "AtKeyword")
    return { from: node.from, options: atRules, validFor: identifier2 };
  if (!context.explicit)
    return null;
  let above = node.resolve(pos), before = above.childBefore(pos);
  if (before && before.name == ":" && above.name == "PseudoClassSelector")
    return { from: pos, options: pseudoClasses, validFor: identifier2 };
  if (before && before.name == ":" && above.name == "Declaration" || above.name == "ArgList")
    return { from: pos, options: values, validFor: identifier2 };
  if (above.name == "Block" || above.name == "Styles")
    return { from: pos, options: properties(), validFor: identifier2 };
  return null;
};
var cssCompletionSource = /* @__PURE__ */ defineCSSCompletionSource((n) => n.name == "VariableName");
var cssLanguage = /* @__PURE__ */ import_language.LRLanguage.define({
  name: "css",
  parser: /* @__PURE__ */ parser3.configure({
    props: [
      /* @__PURE__ */ import_language.indentNodeProp.add({
        Declaration: /* @__PURE__ */ (0, import_language.continuedIndent)()
      }),
      /* @__PURE__ */ import_language.foldNodeProp.add({
        "Block KeyframeList": import_language.foldInside
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*\}$/,
    wordChars: "-"
  }
});
function css() {
  return new import_language.LanguageSupport(cssLanguage, cssLanguage.data.of({ autocomplete: cssCompletionSource }));
}

// node_modules/@lezer/javascript/dist/index.js
var import_lr3 = require("@lezer/lr");
var import_highlight4 = require("@lezer/highlight");
var noSemi = 316;
var noSemiType = 317;
var incdec = 1;
var incdecPrefix = 2;
var questionDot = 3;
var JSXStartTag = 4;
var insertSemi = 318;
var spaces = 320;
var newline2 = 321;
var LineComment = 5;
var BlockComment = 6;
var Dialect_jsx = 0;
var space3 = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
];
var braceR = 125;
var semicolon = 59;
var slash2 = 47;
var star = 42;
var plus = 43;
var minus = 45;
var lt = 60;
var comma = 44;
var question2 = 63;
var dot = 46;
var bracketL2 = 91;
var trackNewline = new import_lr3.ContextTracker({
  start: false,
  shift(context, term) {
    return term == LineComment || term == BlockComment || term == spaces ? context : term == newline2;
  },
  strict: false
});
var insertSemicolon = new import_lr3.ExternalTokenizer((input, stack) => {
  let { next } = input;
  if (next == braceR || next == -1 || stack.context)
    input.acceptToken(insertSemi);
}, { contextual: true, fallback: true });
var noSemicolon = new import_lr3.ExternalTokenizer((input, stack) => {
  let { next } = input, after;
  if (space3.indexOf(next) > -1) return;
  if (next == slash2 && ((after = input.peek(1)) == slash2 || after == star)) return;
  if (next != braceR && next != semicolon && next != -1 && !stack.context)
    input.acceptToken(noSemi);
}, { contextual: true });
var noSemicolonType = new import_lr3.ExternalTokenizer((input, stack) => {
  if (input.next == bracketL2 && !stack.context) input.acceptToken(noSemiType);
}, { contextual: true });
var operatorToken = new import_lr3.ExternalTokenizer((input, stack) => {
  let { next } = input;
  if (next == plus || next == minus) {
    input.advance();
    if (next == input.next) {
      input.advance();
      let mayPostfix = !stack.context && stack.canShift(incdec);
      input.acceptToken(mayPostfix ? incdec : incdecPrefix);
    }
  } else if (next == question2 && input.peek(1) == dot) {
    input.advance();
    input.advance();
    if (input.next < 48 || input.next > 57)
      input.acceptToken(questionDot);
  }
}, { contextual: true });
function identifierChar(ch, start) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch == 95 || ch >= 192 || !start && ch >= 48 && ch <= 57;
}
var jsx = new import_lr3.ExternalTokenizer((input, stack) => {
  if (input.next != lt || !stack.dialectEnabled(Dialect_jsx)) return;
  input.advance();
  if (input.next == slash2) return;
  let back = 0;
  while (space3.indexOf(input.next) > -1) {
    input.advance();
    back++;
  }
  if (identifierChar(input.next, true)) {
    input.advance();
    back++;
    while (identifierChar(input.next, false)) {
      input.advance();
      back++;
    }
    while (space3.indexOf(input.next) > -1) {
      input.advance();
      back++;
    }
    if (input.next == comma) return;
    for (let i = 0; ; i++) {
      if (i == 7) {
        if (!identifierChar(input.next, true)) return;
        break;
      }
      if (input.next != "extends".charCodeAt(i)) break;
      input.advance();
      back++;
    }
  }
  input.acceptToken(JSXStartTag, -back);
});
var jsHighlight = (0, import_highlight4.styleTags)({
  "get set async static": import_highlight4.tags.modifier,
  "for while do if else switch try catch finally return throw break continue default case defer": import_highlight4.tags.controlKeyword,
  "in of await yield void typeof delete instanceof as satisfies": import_highlight4.tags.operatorKeyword,
  "let var const using function class extends": import_highlight4.tags.definitionKeyword,
  "import export from": import_highlight4.tags.moduleKeyword,
  "with debugger new": import_highlight4.tags.keyword,
  TemplateString: import_highlight4.tags.special(import_highlight4.tags.string),
  super: import_highlight4.tags.atom,
  BooleanLiteral: import_highlight4.tags.bool,
  this: import_highlight4.tags.self,
  null: import_highlight4.tags.null,
  Star: import_highlight4.tags.modifier,
  VariableName: import_highlight4.tags.variableName,
  "CallExpression/VariableName TaggedTemplateExpression/VariableName": import_highlight4.tags.function(import_highlight4.tags.variableName),
  VariableDefinition: import_highlight4.tags.definition(import_highlight4.tags.variableName),
  Label: import_highlight4.tags.labelName,
  PropertyName: import_highlight4.tags.propertyName,
  PrivatePropertyName: import_highlight4.tags.special(import_highlight4.tags.propertyName),
  "CallExpression/MemberExpression/PropertyName": import_highlight4.tags.function(import_highlight4.tags.propertyName),
  "FunctionDeclaration/VariableDefinition": import_highlight4.tags.function(import_highlight4.tags.definition(import_highlight4.tags.variableName)),
  "ClassDeclaration/VariableDefinition": import_highlight4.tags.definition(import_highlight4.tags.className),
  "NewExpression/VariableName": import_highlight4.tags.className,
  PropertyDefinition: import_highlight4.tags.definition(import_highlight4.tags.propertyName),
  PrivatePropertyDefinition: import_highlight4.tags.definition(import_highlight4.tags.special(import_highlight4.tags.propertyName)),
  UpdateOp: import_highlight4.tags.updateOperator,
  "LineComment Hashbang": import_highlight4.tags.lineComment,
  BlockComment: import_highlight4.tags.blockComment,
  Number: import_highlight4.tags.number,
  String: import_highlight4.tags.string,
  Escape: import_highlight4.tags.escape,
  ArithOp: import_highlight4.tags.arithmeticOperator,
  LogicOp: import_highlight4.tags.logicOperator,
  BitOp: import_highlight4.tags.bitwiseOperator,
  CompareOp: import_highlight4.tags.compareOperator,
  RegExp: import_highlight4.tags.regexp,
  Equals: import_highlight4.tags.definitionOperator,
  Arrow: import_highlight4.tags.function(import_highlight4.tags.punctuation),
  ": Spread": import_highlight4.tags.punctuation,
  "( )": import_highlight4.tags.paren,
  "[ ]": import_highlight4.tags.squareBracket,
  "{ }": import_highlight4.tags.brace,
  "InterpolationStart InterpolationEnd": import_highlight4.tags.special(import_highlight4.tags.brace),
  ".": import_highlight4.tags.derefOperator,
  ", ;": import_highlight4.tags.separator,
  "@": import_highlight4.tags.meta,
  TypeName: import_highlight4.tags.typeName,
  TypeDefinition: import_highlight4.tags.definition(import_highlight4.tags.typeName),
  "type enum interface implements namespace module declare": import_highlight4.tags.definitionKeyword,
  "abstract global Privacy readonly override": import_highlight4.tags.modifier,
  "is keyof unique infer asserts": import_highlight4.tags.operatorKeyword,
  JSXAttributeValue: import_highlight4.tags.attributeValue,
  JSXText: import_highlight4.tags.content,
  "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": import_highlight4.tags.angleBracket,
  "JSXIdentifier JSXNameSpacedName": import_highlight4.tags.tagName,
  "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": import_highlight4.tags.attributeName,
  "JSXBuiltin/JSXIdentifier": import_highlight4.tags.standard(import_highlight4.tags.tagName)
});
var spec_identifier2 = { __proto__: null, export: 20, as: 25, from: 33, default: 36, async: 41, function: 42, in: 52, out: 55, const: 56, extends: 60, this: 64, true: 72, false: 72, null: 84, void: 88, typeof: 92, super: 108, new: 142, delete: 154, yield: 163, await: 167, class: 172, public: 235, private: 235, protected: 235, readonly: 237, instanceof: 256, satisfies: 259, import: 292, keyof: 349, unique: 353, infer: 359, asserts: 395, is: 397, abstract: 417, implements: 419, type: 421, let: 424, var: 426, using: 429, interface: 435, enum: 439, namespace: 445, module: 447, declare: 451, global: 455, defer: 471, for: 476, of: 485, while: 488, with: 492, do: 496, if: 500, else: 502, switch: 506, case: 512, try: 518, catch: 522, finally: 526, return: 530, throw: 534, break: 538, continue: 542, debugger: 546 };
var spec_word = { __proto__: null, async: 129, get: 131, set: 133, declare: 195, public: 197, private: 197, protected: 197, static: 199, abstract: 201, override: 203, readonly: 209, accessor: 211, new: 401 };
var spec_LessThan = { __proto__: null, "<": 193 };
var parser4 = import_lr3.LRParser.deserialize({
  version: 14,
  states: "$F|Q%TQlOOO%[QlOOO'_QpOOP(lO`OOO*zQ!0MxO'#CiO+RO#tO'#CjO+aO&jO'#CjO+oO#@ItO'#DaO.QQlO'#DgO.bQlO'#DrO%[QlO'#DzO0fQlO'#ESOOQ!0Lf'#E['#E[O1PQ`O'#EXOOQO'#Ep'#EpOOQO'#Il'#IlO1XQ`O'#GsO1dQ`O'#EoO1iQ`O'#EoO3hQ!0MxO'#JrO6[Q!0MxO'#JsO6uQ`O'#F]O6zQ,UO'#FtOOQ!0Lf'#Ff'#FfO7VO7dO'#FfO9XQMhO'#F|O9`Q`O'#F{OOQ!0Lf'#Js'#JsOOQ!0Lb'#Jr'#JrO9eQ`O'#GwOOQ['#K_'#K_O9pQ`O'#IYO9uQ!0LrO'#IZOOQ['#J`'#J`OOQ['#I_'#I_Q`QlOOQ`QlOOO9}Q!L^O'#DvO:UQlO'#EOO:]QlO'#EQO9kQ`O'#GsO:dQMhO'#CoO:rQ`O'#EnO:}Q`O'#EyO;hQMhO'#FeO;xQ`O'#GsOOQO'#K`'#K`O;}Q`O'#K`O<]Q`O'#G{O<]Q`O'#G|O<]Q`O'#HOO9kQ`O'#HRO=SQ`O'#HUO>kQ`O'#CeO>{Q`O'#HcO?TQ`O'#HiO?TQ`O'#HkO`QlO'#HmO?TQ`O'#HoO?TQ`O'#HrO?YQ`O'#HxO?_Q!0LsO'#IOO%[QlO'#IQO?jQ!0LsO'#ISO?uQ!0LsO'#IUO9uQ!0LrO'#IWO@QQ!0MxO'#CiOASQpO'#DlQOQ`OOO%[QlO'#EQOAjQ`O'#ETO:dQMhO'#EnOAuQ`O'#EnOBQQ!bO'#FeOOQ['#Cg'#CgOOQ!0Lb'#Dq'#DqOOQ!0Lb'#Jv'#JvO%[QlO'#JvOOQO'#Jy'#JyOOQO'#Ih'#IhOCQQpO'#EgOOQ!0Lb'#Ef'#EfOOQ!0Lb'#J}'#J}OC|Q!0MSO'#EgODWQpO'#EWOOQO'#Jx'#JxODlQpO'#JyOEyQpO'#EWODWQpO'#EgPFWO&2DjO'#CbPOOO)CD})CD}OOOO'#I`'#I`OFcO#tO,59UOOQ!0Lh,59U,59UOOOO'#Ia'#IaOFqO&jO,59UOGPQ!L^O'#DcOOOO'#Ic'#IcOGWO#@ItO,59{OOQ!0Lf,59{,59{OGfQlO'#IdOGyQ`O'#JtOIxQ!fO'#JtO+}QlO'#JtOJPQ`O,5:ROJgQ`O'#EpOJtQ`O'#KTOKPQ`O'#KSOKPQ`O'#KSOKXQ`O,5;^OK^Q`O'#KROOQ!0Ln,5:^,5:^OKeQlO,5:^OMcQ!0MxO,5:fONSQ`O,5:nONmQ!0LrO'#KQONtQ`O'#KPO9eQ`O'#KPO! YQ`O'#KPO! bQ`O,5;]O! gQ`O'#KPO!#lQ!fO'#JsOOQ!0Lh'#Ci'#CiO%[QlO'#ESO!$[Q!fO,5:sOOQS'#Jz'#JzOOQO-E<j-E<jO9kQ`O,5=_O!$rQ`O,5=_O!$wQlO,5;ZO!&zQMhO'#EkO!(eQ`O,5;ZO!(jQlO'#DyO!(tQpO,5;dO!(|QpO,5;dO%[QlO,5;dOOQ['#FT'#FTOOQ['#FV'#FVO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eOOQ['#FZ'#FZO!)[QlO,5;tOOQ!0Lf,5;y,5;yOOQ!0Lf,5;z,5;zOOQ!0Lf,5;|,5;|O%[QlO'#IpO!+_Q!0LrO,5<iO%[QlO,5;eO!&zQMhO,5;eO!+|QMhO,5;eO!-nQMhO'#E^O%[QlO,5;wOOQ!0Lf,5;{,5;{O!-uQ,UO'#FjO!.rQ,UO'#KXO!.^Q,UO'#KXO!.yQ,UO'#KXOOQO'#KX'#KXO!/_Q,UO,5<SOOOW,5<`,5<`O!/pQlO'#FvOOOW'#Io'#IoO7VO7dO,5<QO!/wQ,UO'#FxOOQ!0Lf,5<Q,5<QO!0hQ$IUO'#CyOOQ!0Lh'#C}'#C}O!0{O#@ItO'#DRO!1iQMjO,5<eO!1pQ`O,5<hO!3YQ(CWO'#GXO!3jQ`O'#GYO!3oQ`O'#GYO!5_Q(CWO'#G^O!6dQpO'#GbOOQO'#Gn'#GnO!,TQMhO'#GmOOQO'#Gp'#GpO!,TQMhO'#GoO!7VQ$IUO'#JlOOQ!0Lh'#Jl'#JlO!7aQ`O'#JkO!7oQ`O'#JjO!7wQ`O'#CuOOQ!0Lh'#C{'#C{O!8YQ`O'#C}OOQ!0Lh'#DV'#DVOOQ!0Lh'#DX'#DXO!8_Q`O,5<eO1SQ`O'#DZO!,TQMhO'#GPO!,TQMhO'#GRO!8gQ`O'#GTO!8lQ`O'#GUO!3oQ`O'#G[O!,TQMhO'#GaO<]Q`O'#JkO!8qQ`O'#EqO!9`Q`O,5<gOOQ!0Lb'#Cr'#CrO!9hQ`O'#ErO!:bQpO'#EsOOQ!0Lb'#KR'#KRO!:iQ!0LrO'#KaO9uQ!0LrO,5=cO`QlO,5>tOOQ['#Jh'#JhOOQ[,5>u,5>uOOQ[-E<]-E<]O!<hQ!0MxO,5:bO!:]QpO,5:`O!?RQ!0MxO,5:jO%[QlO,5:jO!AiQ!0MxO,5:lOOQO,5@z,5@zO!BYQMhO,5=_O!BhQ!0LrO'#JiO9`Q`O'#JiO!ByQ!0LrO,59ZO!CUQpO,59ZO!C^QMhO,59ZO:dQMhO,59ZO!CiQ`O,5;ZO!CqQ`O'#HbO!DVQ`O'#KdO%[QlO,5;}O!:]QpO,5<PO!D_Q`O,5=zO!DdQ`O,5=zO!DiQ`O,5=zO!DwQ`O,5=zO9uQ!0LrO,5=zO<]Q`O,5=jOOQO'#Cy'#CyO!EOQpO,5=gO!EWQMhO,5=hO!EcQ`O,5=jO!EhQ!bO,5=mO!EpQ`O'#K`O?YQ`O'#HWO9kQ`O'#HYO!EuQ`O'#HYO:dQMhO'#H[O!EzQ`O'#H[OOQ[,5=p,5=pO!FPQ`O'#H]O!FbQ`O'#CoO!FgQ`O,59PO!FqQ`O,59PO!HvQlO,59POOQ[,59P,59PO!IWQ!0LrO,59PO%[QlO,59PO!KcQlO'#HeOOQ['#Hf'#HfOOQ['#Hg'#HgO`QlO,5=}O!KyQ`O,5=}O`QlO,5>TO`QlO,5>VO!LOQ`O,5>XO`QlO,5>ZO!LTQ`O,5>^O!LYQlO,5>dOOQ[,5>j,5>jO%[QlO,5>jO9uQ!0LrO,5>lOOQ[,5>n,5>nO#!dQ`O,5>nOOQ[,5>p,5>pO#!dQ`O,5>pOOQ[,5>r,5>rO##QQpO'#D_O%[QlO'#JvO##sQpO'#JvO##}QpO'#DmO#$`QpO'#DmO#&qQlO'#DmO#&xQ`O'#JuO#'QQ`O,5:WO#'VQ`O'#EtO#'eQ`O'#KUO#'mQ`O,5;_O#'rQpO'#DmO#(PQpO'#EVOOQ!0Lf,5:o,5:oO%[QlO,5:oO#(WQ`O,5:oO?YQ`O,5;YO!CUQpO,5;YO!C^QMhO,5;YO:dQMhO,5;YO#(`Q`O,5@bO#(eQ07dO,5:sOOQO-E<f-E<fO#)kQ!0MSO,5;RODWQpO,5:rO#)uQpO,5:rODWQpO,5;RO!ByQ!0LrO,5:rOOQ!0Lb'#Ej'#EjOOQO,5;R,5;RO%[QlO,5;RO#*SQ!0LrO,5;RO#*_Q!0LrO,5;RO!CUQpO,5:rOOQO,5;X,5;XO#*mQ!0LrO,5;RPOOO'#I^'#I^P#+RO&2DjO,58|POOO,58|,58|OOOO-E<^-E<^OOQ!0Lh1G.p1G.pOOOO-E<_-E<_OOOO,59},59}O#+^Q!bO,59}OOOO-E<a-E<aOOQ!0Lf1G/g1G/gO#+cQ!fO,5?OO+}QlO,5?OOOQO,5?U,5?UO#+mQlO'#IdOOQO-E<b-E<bO#+zQ`O,5@`O#,SQ!fO,5@`O#,ZQ`O,5@nOOQ!0Lf1G/m1G/mO%[QlO,5@oO#,cQ`O'#IjOOQO-E<h-E<hO#,ZQ`O,5@nOOQ!0Lb1G0x1G0xOOQ!0Ln1G/x1G/xOOQ!0Ln1G0Y1G0YO%[QlO,5@lO#,wQ!0LrO,5@lO#-YQ!0LrO,5@lO#-aQ`O,5@kO9eQ`O,5@kO#-iQ`O,5@kO#-wQ`O'#ImO#-aQ`O,5@kOOQ!0Lb1G0w1G0wO!(tQpO,5:uO!)PQpO,5:uOOQS,5:w,5:wO#.iQdO,5:wO#.qQMhO1G2yO9kQ`O1G2yOOQ!0Lf1G0u1G0uO#/PQ!0MxO1G0uO#0UQ!0MvO,5;VOOQ!0Lh'#GW'#GWO#0rQ!0MzO'#JlO!$wQlO1G0uO#2}Q!fO'#JwO%[QlO'#JwO#3XQ`O,5:eOOQ!0Lh'#D_'#D_OOQ!0Lf1G1O1G1OO%[QlO1G1OOOQ!0Lf1G1f1G1fO#3^Q`O1G1OO#5rQ!0MxO1G1PO#5yQ!0MxO1G1PO#8aQ!0MxO1G1PO#8hQ!0MxO1G1PO#;OQ!0MxO1G1PO#=fQ!0MxO1G1PO#=mQ!0MxO1G1PO#=tQ!0MxO1G1PO#@[Q!0MxO1G1PO#@cQ!0MxO1G1PO#BpQ?MtO'#CiO#DkQ?MtO1G1`O#DrQ?MtO'#JsO#EVQ!0MxO,5?[OOQ!0Lb-E<n-E<nO#GdQ!0MxO1G1PO#HaQ!0MzO1G1POOQ!0Lf1G1P1G1PO#IdQMjO'#J|O#InQ`O,5:xO#IsQ!0MxO1G1cO#JgQ,UO,5<WO#JoQ,UO,5<XO#JwQ,UO'#FoO#K`Q`O'#FnOOQO'#KY'#KYOOQO'#In'#InO#KeQ,UO1G1nOOQ!0Lf1G1n1G1nOOOW1G1y1G1yO#KvQ?MtO'#JrO#LQQ`O,5<bO!)[QlO,5<bOOOW-E<m-E<mOOQ!0Lf1G1l1G1lO#LVQpO'#KXOOQ!0Lf,5<d,5<dO#L_QpO,5<dO#LdQMhO'#DTOOOO'#Ib'#IbO#LkO#@ItO,59mOOQ!0Lh,59m,59mO%[QlO1G2PO!8lQ`O'#IrO#LvQ`O,5<zOOQ!0Lh,5<w,5<wO!,TQMhO'#IuO#MdQMjO,5=XO!,TQMhO'#IwO#NVQMjO,5=ZO!&zQMhO,5=]OOQO1G2S1G2SO#NaQ!dO'#CrO#NtQ(CWO'#ErO$ |QpO'#GbO$!dQ!dO,5<sO$!kQ`O'#K[O9eQ`O'#K[O$!yQ`O,5<uO$#aQ!dO'#C{O!,TQMhO,5<tO$#kQ`O'#GZO$$PQ`O,5<tO$$UQ!dO'#GWO$$cQ!dO'#K]O$$mQ`O'#K]O!&zQMhO'#K]O$$rQ`O,5<xO$$wQlO'#JvO$%RQpO'#GcO#$`QpO'#GcO$%dQ`O'#GgO!3oQ`O'#GkO$%iQ!0LrO'#ItO$%tQpO,5<|OOQ!0Lp,5<|,5<|O$%{QpO'#GcO$&YQpO'#GdO$&kQpO'#GdO$&pQMjO,5=XO$'QQMjO,5=ZOOQ!0Lh,5=^,5=^O!,TQMhO,5@VO!,TQMhO,5@VO$'bQ`O'#IyO$'vQ`O,5@UO$(OQ`O,59aOOQ!0Lh,59i,59iO$(TQ`O,5@VO$)TQ$IYO,59uOOQ!0Lh'#Jp'#JpO$)vQMjO,5<kO$*iQMjO,5<mO@zQ`O,5<oOOQ!0Lh,5<p,5<pO$*sQ`O,5<vO$*xQMjO,5<{O$+YQ`O'#KPO!$wQlO1G2RO$+_Q`O1G2RO9eQ`O'#KSO9eQ`O'#EtO%[QlO'#EtO9eQ`O'#I{O$+dQ!0LrO,5@{OOQ[1G2}1G2}OOQ[1G4`1G4`OOQ!0Lf1G/|1G/|OOQ!0Lf1G/z1G/zO$-fQ!0MxO1G0UOOQ[1G2y1G2yO!&zQMhO1G2yO%[QlO1G2yO#.tQ`O1G2yO$/jQMhO'#EkOOQ!0Lb,5@T,5@TO$/wQ!0LrO,5@TOOQ[1G.u1G.uO!ByQ!0LrO1G.uO!CUQpO1G.uO!C^QMhO1G.uO$0YQ`O1G0uO$0_Q`O'#CiO$0jQ`O'#KeO$0rQ`O,5=|O$0wQ`O'#KeO$0|Q`O'#KeO$1[Q`O'#JRO$1jQ`O,5AOO$1rQ!fO1G1iOOQ!0Lf1G1k1G1kO9kQ`O1G3fO@zQ`O1G3fO$1yQ`O1G3fO$2OQ`O1G3fO!DiQ`O1G3fO9uQ!0LrO1G3fOOQ[1G3f1G3fO!EcQ`O1G3UO!&zQMhO1G3RO$2TQ`O1G3ROOQ[1G3S1G3SO!&zQMhO1G3SO$2YQ`O1G3SO$2bQpO'#HQOOQ[1G3U1G3UO!6_QpO'#I}O!EhQ!bO1G3XOOQ[1G3X1G3XOOQ[,5=r,5=rO$2jQMhO,5=tO9kQ`O,5=tO$%dQ`O,5=vO9`Q`O,5=vO!CUQpO,5=vO!C^QMhO,5=vO:dQMhO,5=vO$2xQ`O'#KcO$3TQ`O,5=wOOQ[1G.k1G.kO$3YQ!0LrO1G.kO@zQ`O1G.kO$3eQ`O1G.kO9uQ!0LrO1G.kO$5mQ!fO,5AQO$5zQ`O,5AQO9eQ`O,5AQO$6VQlO,5>PO$6^Q`O,5>POOQ[1G3i1G3iO`QlO1G3iOOQ[1G3o1G3oOOQ[1G3q1G3qO?TQ`O1G3sO$6cQlO1G3uO$:gQlO'#HtOOQ[1G3x1G3xO$:tQ`O'#HzO?YQ`O'#H|OOQ[1G4O1G4OO$:|QlO1G4OO9uQ!0LrO1G4UOOQ[1G4W1G4WOOQ!0Lb'#G_'#G_O9uQ!0LrO1G4YO9uQ!0LrO1G4[O$?TQ`O,5@bO!)[QlO,5;`O9eQ`O,5;`O?YQ`O,5:XO!)[QlO,5:XO!CUQpO,5:XO$?YQ?MtO,5:XOOQO,5;`,5;`O$?dQpO'#IeO$?zQ`O,5@aOOQ!0Lf1G/r1G/rO$@SQpO'#IkO$@^Q`O,5@pOOQ!0Lb1G0y1G0yO#$`QpO,5:XOOQO'#Ig'#IgO$@fQpO,5:qOOQ!0Ln,5:q,5:qO#(ZQ`O1G0ZOOQ!0Lf1G0Z1G0ZO%[QlO1G0ZOOQ!0Lf1G0t1G0tO?YQ`O1G0tO!CUQpO1G0tO!C^QMhO1G0tOOQ!0Lb1G5|1G5|O!ByQ!0LrO1G0^OOQO1G0m1G0mO%[QlO1G0mO$@mQ!0LrO1G0mO$@xQ!0LrO1G0mO!CUQpO1G0^ODWQpO1G0^O$AWQ!0LrO1G0mOOQO1G0^1G0^O$AlQ!0MxO1G0mPOOO-E<[-E<[POOO1G.h1G.hOOOO1G/i1G/iO$AvQ!bO,5<iO$BOQ!fO1G4jOOQO1G4p1G4pO%[QlO,5?OO$BYQ`O1G5zO$BbQ`O1G6YO$BjQ!fO1G6ZO9eQ`O,5?UO$BtQ!0MxO1G6WO%[QlO1G6WO$CUQ!0LrO1G6WO$CgQ`O1G6VO$CgQ`O1G6VO9eQ`O1G6VO$CoQ`O,5?XO9eQ`O,5?XOOQO,5?X,5?XO$DTQ`O,5?XO$+YQ`O,5?XOOQO-E<k-E<kOOQS1G0a1G0aOOQS1G0c1G0cO#.lQ`O1G0cOOQ[7+(e7+(eO!&zQMhO7+(eO%[QlO7+(eO$DcQ`O7+(eO$DnQMhO7+(eO$D|Q!0MzO,5=XO$GXQ!0MzO,5=ZO$IdQ!0MzO,5=XO$KuQ!0MzO,5=ZO$NWQ!0MzO,59uO%!]Q!0MzO,5<kO%$hQ!0MzO,5<mO%&sQ!0MzO,5<{OOQ!0Lf7+&a7+&aO%)UQ!0MxO7+&aO%)xQlO'#IfO%*VQ`O,5@cO%*_Q!fO,5@cOOQ!0Lf1G0P1G0PO%*iQ`O7+&jOOQ!0Lf7+&j7+&jO%*nQ?MtO,5:fO%[QlO7+&zO%*xQ?MtO,5:bO%+VQ?MtO,5:jO%+aQ?MtO,5:lO%+kQMhO'#IiO%+uQ`O,5@hOOQ!0Lh1G0d1G0dOOQO1G1r1G1rOOQO1G1s1G1sO%+}Q!jO,5<ZO!)[QlO,5<YOOQO-E<l-E<lOOQ!0Lf7+'Y7+'YOOOW7+'e7+'eOOOW1G1|1G1|O%,YQ`O1G1|OOQ!0Lf1G2O1G2OOOOO,59o,59oO%,_Q!dO,59oOOOO-E<`-E<`OOQ!0Lh1G/X1G/XO%,fQ!0MxO7+'kOOQ!0Lh,5?^,5?^O%-YQMhO1G2fP%-aQ`O'#IrPOQ!0Lh-E<p-E<pO%-}QMjO,5?aOOQ!0Lh-E<s-E<sO%.pQMjO,5?cOOQ!0Lh-E<u-E<uO%.zQ!dO1G2wO%/RQ!dO'#CrO%/iQMhO'#KSO$$wQlO'#JvOOQ!0Lh1G2_1G2_O%/sQ`O'#IqO%0[Q`O,5@vO%0[Q`O,5@vO%0dQ`O,5@vO%0oQ`O,5@vOOQO1G2a1G2aO%0}QMjO1G2`O$+YQ`O'#K[O!,TQMhO1G2`O%1_Q(CWO'#IsO%1lQ`O,5@wO!&zQMhO,5@wO%1tQ!dO,5@wOOQ!0Lh1G2d1G2dO%4UQ!fO'#CiO%4`Q`O,5=POOQ!0Lb,5<},5<}O%4hQpO,5<}OOQ!0Lb,5=O,5=OOCwQ`O,5<}O%4sQpO,5<}OOQ!0Lb,5=R,5=RO$+YQ`O,5=VOOQO,5?`,5?`OOQO-E<r-E<rOOQ!0Lp1G2h1G2hO#$`QpO,5<}O$$wQlO,5=PO%5RQ`O,5=OO%5^QpO,5=OO!,TQMhO'#IuO%6WQMjO1G2sO!,TQMhO'#IwO%6yQMjO1G2uO%7TQMjO1G5qO%7_QMjO1G5qOOQO,5?e,5?eOOQO-E<w-E<wOOQO1G.{1G.{O!,TQMhO1G5qO!,TQMhO1G5qO!:]QpO,59wO%[QlO,59wOOQ!0Lh,5<j,5<jO%7lQ`O1G2ZO!,TQMhO1G2bO%7qQ!0MxO7+'mOOQ!0Lf7+'m7+'mO!$wQlO7+'mO%8eQ`O,5;`OOQ!0Lb,5?g,5?gOOQ!0Lb-E<y-E<yO%8jQ!dO'#K^O#(ZQ`O7+(eO4UQ!fO7+(eO$DfQ`O7+(eO%8tQ!0MvO'#CiO%9XQ!0MvO,5=SO%9lQ`O,5=SO%9tQ`O,5=SOOQ!0Lb1G5o1G5oOOQ[7+$a7+$aO!ByQ!0LrO7+$aO!CUQpO7+$aO!$wQlO7+&aO%9yQ`O'#JQO%:bQ`O,5APOOQO1G3h1G3hO9kQ`O,5APO%:bQ`O,5APO%:jQ`O,5APOOQO,5?m,5?mOOQO-E=P-E=POOQ!0Lf7+'T7+'TO%:oQ`O7+)QO9uQ!0LrO7+)QO9kQ`O7+)QO@zQ`O7+)QO%:tQ`O7+)QOOQ[7+)Q7+)QOOQ[7+(p7+(pO%:yQ!0MvO7+(mO!&zQMhO7+(mO!E^Q`O7+(nOOQ[7+(n7+(nO!&zQMhO7+(nO%;TQ`O'#KbO%;`Q`O,5=lOOQO,5?i,5?iOOQO-E<{-E<{OOQ[7+(s7+(sO%<rQpO'#HZOOQ[1G3`1G3`O!&zQMhO1G3`O%[QlO1G3`O%<yQ`O1G3`O%=UQMhO1G3`O9uQ!0LrO1G3bO$%dQ`O1G3bO9`Q`O1G3bO!CUQpO1G3bO!C^QMhO1G3bO%=dQ`O'#JPO%=xQ`O,5@}O%>QQpO,5@}OOQ!0Lb1G3c1G3cOOQ[7+$V7+$VO@zQ`O7+$VO9uQ!0LrO7+$VO%>]Q`O7+$VO%[QlO1G6lO%[QlO1G6mO%>bQ!0LrO1G6lO%>lQlO1G3kO%>sQ`O1G3kO%>xQlO1G3kOOQ[7+)T7+)TO9uQ!0LrO7+)_O`QlO7+)aOOQ['#Kh'#KhOOQ['#JS'#JSO%?PQlO,5>`OOQ[,5>`,5>`O%[QlO'#HuO%?^Q`O'#HwOOQ[,5>f,5>fO9eQ`O,5>fOOQ[,5>h,5>hOOQ[7+)j7+)jOOQ[7+)p7+)pOOQ[7+)t7+)tOOQ[7+)v7+)vO%?cQpO1G5|O%?}Q?MtO1G0zO%@XQ`O1G0zOOQO1G/s1G/sO%@dQ?MtO1G/sO?YQ`O1G/sO!)[QlO'#DmOOQO,5?P,5?POOQO-E<c-E<cOOQO,5?V,5?VOOQO-E<i-E<iO!CUQpO1G/sOOQO-E<e-E<eOOQ!0Ln1G0]1G0]OOQ!0Lf7+%u7+%uO#(ZQ`O7+%uOOQ!0Lf7+&`7+&`O?YQ`O7+&`O!CUQpO7+&`OOQO7+%x7+%xO$AlQ!0MxO7+&XOOQO7+&X7+&XO%[QlO7+&XO%@nQ!0LrO7+&XO!ByQ!0LrO7+%xO!CUQpO7+%xO%@yQ!0LrO7+&XO%AXQ!0MxO7++rO%[QlO7++rO%AiQ`O7++qO%AiQ`O7++qOOQO1G4s1G4sO9eQ`O1G4sO%AqQ`O1G4sOOQS7+%}7+%}O#(ZQ`O<<LPO4UQ!fO<<LPO%BPQ`O<<LPOOQ[<<LP<<LPO!&zQMhO<<LPO%[QlO<<LPO%BXQ`O<<LPO%BdQ!0MzO,5?aO%DoQ!0MzO,5?cO%FzQ!0MzO1G2`O%I]Q!0MzO1G2sO%KhQ!0MzO1G2uO%MsQ!fO,5?QO%[QlO,5?QOOQO-E<d-E<dO%M}Q`O1G5}OOQ!0Lf<<JU<<JUO%NVQ?MtO1G0uO&!^Q?MtO1G1PO&!eQ?MtO1G1PO&$fQ?MtO1G1PO&$mQ?MtO1G1PO&&nQ?MtO1G1PO&(oQ?MtO1G1PO&(vQ?MtO1G1PO&(}Q?MtO1G1PO&+OQ?MtO1G1PO&+VQ?MtO1G1PO&+^Q!0MxO<<JfO&-UQ?MtO1G1PO&.RQ?MvO1G1PO&/UQ?MvO'#JlO&1[Q?MtO1G1cO&1iQ?MtO1G0UO&1sQMjO,5?TOOQO-E<g-E<gO!)[QlO'#FqOOQO'#KZ'#KZOOQO1G1u1G1uO&1}Q`O1G1tO&2SQ?MtO,5?[OOOW7+'h7+'hOOOO1G/Z1G/ZO&2^Q!dO1G4xOOQ!0Lh7+(Q7+(QP!&zQMhO,5?^O!,TQMhO7+(cO&2eQ`O,5?]O9eQ`O,5?]O$+YQ`O,5?]OOQO-E<o-E<oO&2sQ`O1G6bO&2sQ`O1G6bO&2{Q`O1G6bO&3WQMjO7+'zO&3hQ!dO,5?_O&3rQ`O,5?_O!&zQMhO,5?_OOQO-E<q-E<qO&3wQ!dO1G6cO&4RQ`O1G6cO&4ZQ`O1G2kO!&zQMhO1G2kOOQ!0Lb1G2i1G2iOOQ!0Lb1G2j1G2jO%4hQpO1G2iO!CUQpO1G2iOCwQ`O1G2iOOQ!0Lb1G2q1G2qO&4`QpO1G2iO&4nQ`O1G2kO$+YQ`O1G2jOCwQ`O1G2jO$$wQlO1G2kO&4vQ`O1G2jO&5jQMjO,5?aOOQ!0Lh-E<t-E<tO&6]QMjO,5?cOOQ!0Lh-E<v-E<vO!,TQMhO7++]O&6gQMjO7++]O&6qQMjO7++]OOQ!0Lh1G/c1G/cO&7OQ`O1G/cOOQ!0Lh7+'u7+'uO&7TQMjO7+'|O&7eQ!0MxO<<KXOOQ!0Lf<<KX<<KXO&8XQ`O1G0zO!&zQMhO'#IzO&8^Q`O,5@xO&:`Q!fO<<LPO!&zQMhO1G2nO&:gQ!0LrO1G2nOOQ[<<G{<<G{O!ByQ!0LrO<<G{O&:xQ!0MxO<<I{OOQ!0Lf<<I{<<I{OOQO,5?l,5?lO&;lQ`O,5?lO&;qQ`O,5?lOOQO-E=O-E=OO&<PQ`O1G6kO&<PQ`O1G6kO9kQ`O1G6kO@zQ`O<<LlOOQ[<<Ll<<LlO&<XQ`O<<LlO9uQ!0LrO<<LlO9kQ`O<<LlOOQ[<<LX<<LXO%:yQ!0MvO<<LXOOQ[<<LY<<LYO!E^Q`O<<LYO&<^QpO'#I|O&<iQ`O,5@|O!)[QlO,5@|OOQ[1G3W1G3WOOQO'#JO'#JOO9uQ!0LrO'#JOO&<qQpO,5=uOOQ[,5=u,5=uO&<xQpO'#EgO&=PQpO'#GeO&=UQ`O7+(zO&=ZQ`O7+(zOOQ[7+(z7+(zO!&zQMhO7+(zO%[QlO7+(zO&=cQ`O7+(zOOQ[7+(|7+(|O9uQ!0LrO7+(|O$%dQ`O7+(|O9`Q`O7+(|O!CUQpO7+(|O&=nQ`O,5?kOOQO-E<}-E<}OOQO'#H^'#H^O&=yQ`O1G6iO9uQ!0LrO<<GqOOQ[<<Gq<<GqO@zQ`O<<GqO&>RQ`O7+,WO&>WQ`O7+,XO%[QlO7+,WO%[QlO7+,XOOQ[7+)V7+)VO&>]Q`O7+)VO&>bQlO7+)VO&>iQ`O7+)VOOQ[<<Ly<<LyOOQ[<<L{<<L{OOQ[-E=Q-E=QOOQ[1G3z1G3zO&>nQ`O,5>aOOQ[,5>c,5>cO&>sQ`O1G4QO9eQ`O7+&fO!)[QlO7+&fOOQO7+%_7+%_O&>xQ?MtO1G6ZO?YQ`O7+%_OOQ!0Lf<<Ia<<IaOOQ!0Lf<<Iz<<IzO?YQ`O<<IzOOQO<<Is<<IsO$AlQ!0MxO<<IsO%[QlO<<IsOOQO<<Id<<IdO!ByQ!0LrO<<IdO&?SQ!0LrO<<IsO&?_Q!0MxO<= ^O&?oQ`O<= ]OOQO7+*_7+*_O9eQ`O7+*_OOQ[ANAkANAkO&?wQ!fOANAkO!&zQMhOANAkO#(ZQ`OANAkO4UQ!fOANAkO&@OQ`OANAkO%[QlOANAkO&@WQ!0MzO7+'zO&BiQ!0MzO,5?aO&DtQ!0MzO,5?cO&GPQ!0MzO7+'|O&IbQ!fO1G4lO&IlQ?MtO7+&aO&KpQ?MvO,5=XO&MwQ?MvO,5=ZO&NXQ?MvO,5=XO&NiQ?MvO,5=ZO&NyQ?MvO,59uO'#PQ?MvO,5<kO'%SQ?MvO,5<mO''hQ?MvO,5<{O')^Q?MtO7+'kO')kQ?MtO7+'mO')xQ`O,5<]OOQO7+'`7+'`OOQ!0Lh7+*d7+*dO')}QMjO<<K}OOQO1G4w1G4wO'*UQ`O1G4wO'*aQ`O1G4wO'*oQ`O7++|O'*oQ`O7++|O!&zQMhO1G4yO'*wQ!dO1G4yO'+RQ`O7++}O'+ZQ`O7+(VO'+fQ!dO7+(VOOQ!0Lb7+(T7+(TOOQ!0Lb7+(U7+(UO!CUQpO7+(TOCwQ`O7+(TO'+pQ`O7+(VO!&zQMhO7+(VO$+YQ`O7+(UO'+uQ`O7+(VOCwQ`O7+(UO'+}QMjO<<NwO!,TQMhO<<NwOOQ!0Lh7+$}7+$}O',XQ!dO,5?fOOQO-E<x-E<xO',cQ!0MvO7+(YO!&zQMhO7+(YOOQ[AN=gAN=gO9kQ`O1G5WOOQO1G5W1G5WO',sQ`O1G5WO',xQ`O7+,VO',xQ`O7+,VO9uQ!0LrOANBWO@zQ`OANBWOOQ[ANBWANBWO'-QQ`OANBWOOQ[ANAsANAsOOQ[ANAtANAtO'-VQ`O,5?hOOQO-E<z-E<zO'-bQ?MtO1G6hOOQO,5?j,5?jOOQO-E<|-E<|OOQ[1G3a1G3aO'-lQ`O,5=POOQ[<<Lf<<LfO!&zQMhO<<LfO&=UQ`O<<LfO'-qQ`O<<LfO%[QlO<<LfOOQ[<<Lh<<LhO9uQ!0LrO<<LhO$%dQ`O<<LhO9`Q`O<<LhO'-yQpO1G5VO'.UQ`O7+,TOOQ[AN=]AN=]O9uQ!0LrOAN=]OOQ[<= r<= rOOQ[<= s<= sO'.^Q`O<= rO'.cQ`O<= sOOQ[<<Lq<<LqO'.hQ`O<<LqO'.mQlO<<LqOOQ[1G3{1G3{O?YQ`O7+)lO'.tQ`O<<JQO'/PQ?MtO<<JQOOQO<<Hy<<HyOOQ!0LfAN?fAN?fOOQOAN?_AN?_O$AlQ!0MxOAN?_OOQOAN?OAN?OO%[QlOAN?_OOQO<<My<<MyOOQ[G27VG27VO!&zQMhOG27VO#(ZQ`OG27VO'/ZQ!fOG27VO4UQ!fOG27VO'/bQ`OG27VO'/jQ?MtO<<JfO'/wQ?MvO1G2`O'1mQ?MvO,5?aO'3pQ?MvO,5?cO'5sQ?MvO1G2sO'7vQ?MvO1G2uO'9yQ?MtO<<KXO':WQ?MtO<<I{OOQO1G1w1G1wO!,TQMhOANAiOOQO7+*c7+*cO':eQ`O7+*cO':pQ`O<= hO':xQ!dO7+*eOOQ!0Lb<<Kq<<KqO$+YQ`O<<KqOCwQ`O<<KqO';SQ`O<<KqO!&zQMhO<<KqOOQ!0Lb<<Ko<<KoO!CUQpO<<KoO';_Q!dO<<KqOOQ!0Lb<<Kp<<KpO';iQ`O<<KqO!&zQMhO<<KqO$+YQ`O<<KpO';nQMjOANDcO';xQ!0MvO<<KtOOQO7+*r7+*rO9kQ`O7+*rO'<YQ`O<= qOOQ[G27rG27rO9uQ!0LrOG27rO@zQ`OG27rO!)[QlO1G5SO'<bQ`O7+,SO'<jQ`O1G2kO&=UQ`OANBQOOQ[ANBQANBQO!&zQMhOANBQO'<oQ`OANBQOOQ[ANBSANBSO9uQ!0LrOANBSO$%dQ`OANBSOOQO'#H_'#H_OOQO7+*q7+*qOOQ[G22wG22wOOQ[ANE^ANE^OOQ[ANE_ANE_OOQ[ANB]ANB]O'<wQ`OANB]OOQ[<<MW<<MWO!)[QlOAN?lOOQOG24yG24yO$AlQ!0MxOG24yO#(ZQ`OLD,qOOQ[LD,qLD,qO!&zQMhOLD,qO'<|Q!fOLD,qO'=TQ?MvO7+'zO'>yQ?MvO,5?aO'@|Q?MvO,5?cO'CPQ?MvO7+'|O'DuQMjOG27TOOQO<<M}<<M}OOQ!0LbANA]ANA]O$+YQ`OANA]OCwQ`OANA]O'EVQ!dOANA]OOQ!0LbANAZANAZO'E^Q`OANA]O!&zQMhOANA]O'EiQ!dOANA]OOQ!0LbANA[ANA[OOQO<<N^<<N^OOQ[LD-^LD-^O9uQ!0LrOLD-^O'EsQ?MtO7+*nOOQO'#Gf'#GfOOQ[G27lG27lO&=UQ`OG27lO!&zQMhOG27lOOQ[G27nG27nO9uQ!0LrOG27nOOQ[G27wG27wO'E}Q?MtOG25WOOQOLD*eLD*eOOQ[!$(!]!$(!]O#(ZQ`O!$(!]O!&zQMhO!$(!]O'FXQ!0MzOG27TOOQ!0LbG26wG26wO$+YQ`OG26wO'HjQ`OG26wOCwQ`OG26wO'HuQ!dOG26wO!&zQMhOG26wOOQ[!$(!x!$(!xOOQ[LD-WLD-WO&=UQ`OLD-WOOQ[LD-YLD-YOOQ[!)9Ew!)9EwO#(ZQ`O!)9EwOOQ!0LbLD,cLD,cO$+YQ`OLD,cOCwQ`OLD,cO'H|Q`OLD,cO'IXQ!dOLD,cOOQ[!$(!r!$(!rOOQ[!.K;c!.K;cO'I`Q?MvOG27TOOQ!0Lb!$( }!$( }O$+YQ`O!$( }OCwQ`O!$( }O'KUQ`O!$( }OOQ!0Lb!)9Ei!)9EiO$+YQ`O!)9EiOCwQ`O!)9EiOOQ!0Lb!.K;T!.K;TO$+YQ`O!.K;TOOQ!0Lb!4/0o!4/0oO!)[QlO'#DzO1PQ`O'#EXO'KaQ!fO'#JrO'KhQ!L^O'#DvO'KoQlO'#EOO'KvQ!fO'#CiO'N^Q!fO'#CiO!)[QlO'#EQO'NnQlO,5;ZO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO'#IpO(!qQ`O,5<iO!)[QlO,5;eO(!yQMhO,5;eO($dQMhO,5;eO!)[QlO,5;wO!&zQMhO'#GmO(!yQMhO'#GmO!&zQMhO'#GoO(!yQMhO'#GoO1SQ`O'#DZO1SQ`O'#DZO!&zQMhO'#GPO(!yQMhO'#GPO!&zQMhO'#GRO(!yQMhO'#GRO!&zQMhO'#GaO(!yQMhO'#GaO!)[QlO,5:jO($kQpO'#D_O($uQpO'#JvO!)[QlO,5@oO'NnQlO1G0uO(%PQ?MtO'#CiO!)[QlO1G2PO!&zQMhO'#IuO(!yQMhO'#IuO!&zQMhO'#IwO(!yQMhO'#IwO(%ZQ!dO'#CrO!&zQMhO,5<tO(!yQMhO,5<tO'NnQlO1G2RO!)[QlO7+&zO!&zQMhO1G2`O(!yQMhO1G2`O!&zQMhO'#IuO(!yQMhO'#IuO!&zQMhO'#IwO(!yQMhO'#IwO!&zQMhO1G2bO(!yQMhO1G2bO'NnQlO7+'mO'NnQlO7+&aO!&zQMhOANAiO(!yQMhOANAiO(%nQ`O'#EoO(%sQ`O'#EoO(%{Q`O'#F]O(&QQ`O'#EyO(&VQ`O'#KTO(&bQ`O'#KRO(&mQ`O,5;ZO(&rQMjO,5<eO(&yQ`O'#GYO('OQ`O'#GYO('TQ`O,5<eO(']Q`O,5<gO('eQ`O,5;ZO('mQ?MtO1G1`O('tQ`O,5<tO('yQ`O,5<tO((OQ`O,5<vO((TQ`O,5<vO((YQ`O1G2RO((_Q`O1G0uO((dQMjO<<K}O((kQMjO<<K}O((rQMhO'#F|O9`Q`O'#F{OAuQ`O'#EnO!)[QlO,5;tO!3oQ`O'#GYO!3oQ`O'#GYO!3oQ`O'#G[O!3oQ`O'#G[O!,TQMhO7+(cO!,TQMhO7+(cO%.zQ!dO1G2wO%.zQ!dO1G2wO!&zQMhO,5=]O!&zQMhO,5=]",
  stateData: "()x~O'|OS'}OSTOS(ORQ~OPYOQYOSfOY!VOaqOdzOeyOl!POpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_XO!iuO!lZO!oYO!pYO!qYO!svO!uwO!xxO!|]O$W|O$niO%h}O%j!QO%l!OO%m!OO%n!OO%q!RO%s!SO%v!TO%w!TO%y!UO&W!WO&^!XO&`!YO&b!ZO&d![O&g!]O&m!^O&s!_O&u!`O&w!aO&y!bO&{!cO(TSO(VTO(YUO(aVO(o[O~OWtO~P`OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$W!kO$niO(T!dO(VTO(YUO(aVO(o[O~Oa!wOs!nO!S!oO!b!yO!c!vO!d!vO!|<VO#T!pO#U!pO#V!xO#W!pO#X!pO#[!zO#]!zO(U!lO(VTO(YUO(e!mO(o!sO~O(O!{O~OP]XR]X[]Xa]Xj]Xr]X!Q]X!S]X!]]X!l]X!p]X#R]X#S]X#`]X#kfX#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#x]X#z]X#{]X$Q]X'z]X(a]X(r]X(y]X(z]X~O!g%RX~P(qO_!}O(V#PO(W!}O(X#PO~O_#QO(X#PO(Y#PO(Z#QO~Ox#SO!U#TO(b#TO(c#VO~OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$W!kO$niO(T<ZO(VTO(YUO(aVO(o[O~O![#ZO!]#WO!Y(hP!Y(vP~P+}O!^#cO~P`OPYOQYOSfOd!jOe!iOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$W!kO$niO(VTO(YUO(aVO(o[O~Op#mO![#iO!|]O#i#lO#j#iO(T<[O!k(sP~P.iO!l#oO(T#nO~O!x#sO!|]O%h#tO~O#k#uO~O!g#vO#k#uO~OP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!]$_O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO#x$UO#z$WO#{$XO(aVO(r$YO(y#|O(z#}O~Oa(fX'z(fX'w(fX!k(fX!Y(fX!_(fX%i(fX!g(fX~P1qO#S$dO#`$eO$Q$eOP(gXR(gX[(gXj(gXr(gX!Q(gX!S(gX!](gX!l(gX!p(gX#R(gX#n(gX#o(gX#p(gX#q(gX#r(gX#s(gX#t(gX#u(gX#v(gX#x(gX#z(gX#{(gX(a(gX(r(gX(y(gX(z(gX!_(gX%i(gX~Oa(gX'z(gX'w(gX!Y(gX!k(gXv(gX!g(gX~P4UO#`$eO~O$]$hO$_$gO$f$mO~OSfO!_$nO$i$oO$k$qO~Oh%VOj%dOk%dOp%WOr%XOs$tOt$tOz%YO|%ZO!O%]O!S${O!_$|O!i%bO!l$xO#j%cO$W%`O$t%^O$v%_O$y%aO(T$sO(VTO(YUO(a$uO(y$}O(z%POg(^P~Ol%[O~P7eO!l%eO~O!S%hO!_%iO(T%gO~O!g%mO~Oa%nO'z%nO~O!Q%rO~P%[O(U!lO~P%[O%n%vO~P%[Oh%VO!l%eO(T%gO(U!lO~Oe%}O!l%eO(T%gO~Oj$RO~O!_&PO(T%gO(U!lO(VTO(YUO`)WP~O!Q&SO!l&RO%j&VO&T&WO~P;SO!x#sO~O%s&YO!S)SX!_)SX(T)SX~O(T&ZO~Ol!PO!u&`O%j!QO%l!OO%m!OO%n!OO%q!RO%s!SO%v!TO%w!TO~Od&eOe&dO!x&bO%h&cO%{&aO~P<bOd&hOeyOl!PO!_&gO!u&`O!xxO!|]O%h}O%l!OO%m!OO%n!OO%q!RO%s!SO%v!TO%w!TO%y!UO~Ob&kO#`&nO%j&iO(U!lO~P=gO!l&oO!u&sO~O!l#oO~O!_XO~Oa%nO'x&{O'z%nO~Oa%nO'x'OO'z%nO~Oa%nO'x'QO'z%nO~O'w]X!Y]Xv]X!k]X&[]X!_]X%i]X!g]X~P(qO!b'_O!c'WO!d'WO(U!lO(VTO(YUO~Os'UO!S'TO!['XO(e'SO!^(iP!^(xP~P@nOn'bO!_'`O(T%gO~Oe'gO!l%eO(T%gO~O!Q&SO!l&RO~Os!nO!S!oO!|<VO#T!pO#U!pO#W!pO#X!pO(U!lO(VTO(YUO(e!mO(o!sO~O!b'mO!c'lO!d'lO#V!pO#['nO#]'nO~PBYOa%nOh%VO!g#vO!l%eO'z%nO(r'pO~O!p'tO#`'rO~PChOs!nO!S!oO(VTO(YUO(e!mO(o!sO~O!_XOs(mX!S(mX!b(mX!c(mX!d(mX!|(mX#T(mX#U(mX#V(mX#W(mX#X(mX#[(mX#](mX(U(mX(V(mX(Y(mX(e(mX(o(mX~O!c'lO!d'lO(U!lO~PDWO(P'xO(Q'xO(R'zO~O_!}O(V'|O(W!}O(X'|O~O_#QO(X'|O(Y'|O(Z#QO~Ov(OO~P%[Ox#SO!U#TO(b#TO(c(RO~O![(TO!Y'WX!Y'^X!]'WX!]'^X~P+}O!](VO!Y(hX~OP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!](VO!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO#x$UO#z$WO#{$XO(aVO(r$YO(y#|O(z#}O~O!Y(hX~PHRO!Y([O~O!Y(uX!](uX!g(uX!k(uX(r(uX~O#`(uX#k#dX!^(uX~PJUO#`(]O!Y(wX!](wX~O!](^O!Y(vX~O!Y(aO~O#`$eO~PJUO!^(bO~P`OR#zO!Q#yO!S#{O!l#xO(aVOP!na[!naj!nar!na!]!na!p!na#R!na#n!na#o!na#p!na#q!na#r!na#s!na#t!na#u!na#v!na#x!na#z!na#{!na(r!na(y!na(z!na~Oa!na'z!na'w!na!Y!na!k!nav!na!_!na%i!na!g!na~PKlO!k(cO~O!g#vO#`(dO(r'pO!](tXa(tX'z(tX~O!k(tX~PNXO!S%hO!_%iO!|]O#i(iO#j(hO(T%gO~O!](jO!k(sX~O!k(lO~O!S%hO!_%iO#j(hO(T%gO~OP(gXR(gX[(gXj(gXr(gX!Q(gX!S(gX!](gX!l(gX!p(gX#R(gX#n(gX#o(gX#p(gX#q(gX#r(gX#s(gX#t(gX#u(gX#v(gX#x(gX#z(gX#{(gX(a(gX(r(gX(y(gX(z(gX~O!g#vO!k(gX~P! uOR(nO!Q(mO!l#xO#S$dO!|!{a!S!{a~O!x!{a%h!{a!_!{a#i!{a#j!{a(T!{a~P!#vO!x(rO~OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_XO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$W!kO$niO(T!dO(VTO(YUO(aVO(o[O~Oh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O<sO!S${O!_$|O!i>VO!l$xO#j<yO$W%`O$t<uO$v<wO$y%aO(T(vO(VTO(YUO(a$uO(y$}O(z%PO~O#k(xO~O![(zO!k(kP~P%[O(e(|O(o[O~O!S)OO!l#xO(e(|O(o[O~OP<UOQ<UOSfOd>ROe!iOpkOr<UOskOtkOzkO|<UO!O<UO!SWO!WkO!XkO!_!eO!i<XO!lZO!o<UO!p<UO!q<UO!s<YO!u<]O!x!hO$W!kO$n>PO(T)]O(VTO(YUO(aVO(o[O~O!]$_Oa$qa'z$qa'w$qa!k$qa!Y$qa!_$qa%i$qa!g$qa~Ol)dO~P!&zOh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O%]O!S${O!_$|O!i%bO!l$xO#j%cO$W%`O$t%^O$v%_O$y%aO(T(vO(VTO(YUO(a$uO(y$}O(z%PO~Og(pP~P!,TO!Q)iO!g)hO!_$^X$Z$^X$]$^X$_$^X$f$^X~O!g)hO!_({X$Z({X$]({X$_({X$f({X~O!Q)iO~P!.^O!Q)iO!_({X$Z({X$]({X$_({X$f({X~O!_)kO$Z)oO$])jO$_)jO$f)pO~O![)sO~P!)[O$]$hO$_$gO$f)wO~On$zX!Q$zX#S$zX'y$zX(y$zX(z$zX~OgmXg$zXnmX!]mX#`mX~P!0SOx)yO(b)zO(c)|O~On*VO!Q*OO'y*PO(y$}O(z%PO~Og)}O~P!1WOg*WO~Oh%VOr%XOs$tOt$tOz%YO|%ZO!O<sO!S*YO!_*ZO!i>VO!l$xO#j<yO$W%`O$t<uO$v<wO$y%aO(VTO(YUO(a$uO(y$}O(z%PO~Op*`O![*^O(T*XO!k)OP~P!1uO#k*aO~O!l*bO~Oh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O<sO!S${O!_$|O!i>VO!l$xO#j<yO$W%`O$t<uO$v<wO$y%aO(T*dO(VTO(YUO(a$uO(y$}O(z%PO~O![*gO!Y)PP~P!3tOr*sOs!nO!S*iO!b*qO!c*kO!d*kO!l*bO#[*rO%`*mO(U!lO(VTO(YUO(e!mO~O!^*pO~P!5iO#S$dOn(`X!Q(`X'y(`X(y(`X(z(`X!](`X#`(`X~Og(`X$O(`X~P!6kOn*xO#`*wOg(_X!](_X~O!]*yOg(^X~Oj%dOk%dOl%dO(T&ZOg(^P~Os*|O~Og)}O(T&ZO~O!l+SO~O(T(vO~Op+WO!S%hO![#iO!_%iO!|]O#i#lO#j#iO(T%gO!k(sP~O!g#vO#k+XO~O!S%hO![+ZO!](^O!_%iO(T%gO!Y(vP~Os'[O!S+]O![+[O(VTO(YUO(e(|O~O!^(xP~P!9|O!]+^Oa)TX'z)TX~OP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO#x$UO#z$WO#{$XO(aVO(r$YO(y#|O(z#}O~Oa!ja!]!ja'z!ja'w!ja!Y!ja!k!jav!ja!_!ja%i!ja!g!ja~P!:tOR#zO!Q#yO!S#{O!l#xO(aVOP!ra[!raj!rar!ra!]!ra!p!ra#R!ra#n!ra#o!ra#p!ra#q!ra#r!ra#s!ra#t!ra#u!ra#v!ra#x!ra#z!ra#{!ra(r!ra(y!ra(z!ra~Oa!ra'z!ra'w!ra!Y!ra!k!rav!ra!_!ra%i!ra!g!ra~P!=[OR#zO!Q#yO!S#{O!l#xO(aVOP!ta[!taj!tar!ta!]!ta!p!ta#R!ta#n!ta#o!ta#p!ta#q!ta#r!ta#s!ta#t!ta#u!ta#v!ta#x!ta#z!ta#{!ta(r!ta(y!ta(z!ta~Oa!ta'z!ta'w!ta!Y!ta!k!tav!ta!_!ta%i!ta!g!ta~P!?rOh%VOn+gO!_'`O%i+fO~O!g+iOa(]X!_(]X'z(]X!](]X~Oa%nO!_XO'z%nO~Oh%VO!l%eO~Oh%VO!l%eO(T%gO~O!g#vO#k(xO~Ob+tO%j+uO(T+qO(VTO(YUO!^)XP~O!]+vO`)WX~O[+zO~O`+{O~O!_&PO(T%gO(U!lO`)WP~O%j,OO~P;SOh%VO#`,SO~Oh%VOn,VO!_$|O~O!_,XO~O!Q,ZO!_XO~O%n%vO~O!x,`O~Oe,eO~Ob,fO(T#nO(VTO(YUO!^)VP~Oe%}O~O%j!QO(T&ZO~P=gO[,kO`,jO~OPYOQYOSfOdzOeyOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!iuO!lZO!oYO!pYO!qYO!svO!xxO!|]O$niO%h}O(VTO(YUO(aVO(o[O~O!_!eO!u!gO$W!kO(T!dO~P!FyO`,jOa%nO'z%nO~OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!x!hO$W!kO$niO(T!dO(VTO(YUO(aVO(o[O~Oa,pOl!OO!uwO%l!OO%m!OO%n!OO~P!IcO!l&oO~O&^,vO~O!_,xO~O&o,zO&q,{OP&laQ&laS&laY&laa&lad&lae&lal&lap&lar&las&lat&laz&la|&la!O&la!S&la!W&la!X&la!_&la!i&la!l&la!o&la!p&la!q&la!s&la!u&la!x&la!|&la$W&la$n&la%h&la%j&la%l&la%m&la%n&la%q&la%s&la%v&la%w&la%y&la&W&la&^&la&`&la&b&la&d&la&g&la&m&la&s&la&u&la&w&la&y&la&{&la'w&la(T&la(V&la(Y&la(a&la(o&la!^&la&e&lab&la&j&la~O(T-QO~Oh!eX!]!RX!^!RX!g!RX!g!eX!l!eX#`!RX~O!]!eX!^!eX~P#!iO!g-VO#`-UOh(jX!]#hX!^#hX!g(jX!l(jX~O!](jX!^(jX~P##[Oh%VO!g-XO!l%eO!]!aX!^!aX~Os!nO!S!oO(VTO(YUO(e!mO~OP<UOQ<UOSfOd>ROe!iOpkOr<UOskOtkOzkO|<UO!O<UO!SWO!WkO!XkO!_!eO!i<XO!lZO!o<UO!p<UO!q<UO!s<YO!u<]O!x!hO$W!kO$n>PO(VTO(YUO(aVO(o[O~O(T=QO~P#$qO!]-]O!^(iX~O!^-_O~O!g-VO#`-UO!]#hX!^#hX~O!]-`O!^(xX~O!^-bO~O!c-cO!d-cO(U!lO~P#$`O!^-fO~P'_On-iO!_'`O~O!Y-nO~Os!{a!b!{a!c!{a!d!{a#T!{a#U!{a#V!{a#W!{a#X!{a#[!{a#]!{a(U!{a(V!{a(Y!{a(e!{a(o!{a~P!#vO!p-sO#`-qO~PChO!c-uO!d-uO(U!lO~PDWOa%nO#`-qO'z%nO~Oa%nO!g#vO#`-qO'z%nO~Oa%nO!g#vO!p-sO#`-qO'z%nO(r'pO~O(P'xO(Q'xO(R-zO~Ov-{O~O!Y'Wa!]'Wa~P!:tO![.PO!Y'WX!]'WX~P%[O!](VO!Y(ha~O!Y(ha~PHRO!](^O!Y(va~O!S%hO![.TO!_%iO(T%gO!Y'^X!]'^X~O#`.VO!](ta!k(taa(ta'z(ta~O!g#vO~P#,wO!](jO!k(sa~O!S%hO!_%iO#j.ZO(T%gO~Op.`O!S%hO![.]O!_%iO!|]O#i._O#j.]O(T%gO!]'aX!k'aX~OR.dO!l#xO~Oh%VOn.gO!_'`O%i.fO~Oa#ci!]#ci'z#ci'w#ci!Y#ci!k#civ#ci!_#ci%i#ci!g#ci~P!:tOn>]O!Q*OO'y*PO(y$}O(z%PO~O#k#_aa#_a#`#_a'z#_a!]#_a!k#_a!_#_a!Y#_a~P#/sO#k(`XP(`XR(`X[(`Xa(`Xj(`Xr(`X!S(`X!l(`X!p(`X#R(`X#n(`X#o(`X#p(`X#q(`X#r(`X#s(`X#t(`X#u(`X#v(`X#x(`X#z(`X#{(`X'z(`X(a(`X(r(`X!k(`X!Y(`X'w(`Xv(`X!_(`X%i(`X!g(`X~P!6kO!].tO!k(kX~P!:tO!k.wO~O!Y.yO~OP$[OR#zO!Q#yO!S#{O!l#xO!p$[O(aVO[#mia#mij#mir#mi!]#mi#R#mi#o#mi#p#mi#q#mi#r#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi'z#mi(r#mi(y#mi(z#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#n#mi~P#3cO#n$OO~P#3cOP$[OR#zOr$aO!Q#yO!S#{O!l#xO!p$[O#n$OO#o$PO#p$PO#q$PO(aVO[#mia#mij#mi!]#mi#R#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi'z#mi(r#mi(y#mi(z#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#r#mi~P#6QO#r$QO~P#6QOP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO(aVOa#mi!]#mi#x#mi#z#mi#{#mi'z#mi(r#mi(y#mi(z#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#v#mi~P#8oOP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO(aVO(z#}Oa#mi!]#mi#z#mi#{#mi'z#mi(r#mi(y#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#x$UO~P#;VO#x#mi~P#;VO#v$SO~P#8oOP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO#x$UO(aVO(y#|O(z#}Oa#mi!]#mi#{#mi'z#mi(r#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#z#mi~P#={O#z$WO~P#={OP]XR]X[]Xj]Xr]X!Q]X!S]X!l]X!p]X#R]X#S]X#`]X#kfX#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#x]X#z]X#{]X$Q]X(a]X(r]X(y]X(z]X!]]X!^]X~O$O]X~P#@jOP$[OR#zO[<mOj<bOr<kO!Q#yO!S#{O!l#xO!p$[O#R<bO#n<_O#o<`O#p<`O#q<`O#r<aO#s<bO#t<bO#u<lO#v<cO#x<eO#z<gO#{<hO(aVO(r$YO(y#|O(z#}O~O$O.{O~P#BwO#S$dO#`<nO$Q<nO$O(gX!^(gX~P! uOa'da!]'da'z'da'w'da!k'da!Y'dav'da!_'da%i'da!g'da~P!:tO[#mia#mij#mir#mi!]#mi#R#mi#r#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi'z#mi(r#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~OP$[OR#zO!Q#yO!S#{O!l#xO!p$[O#n$OO#o$PO#p$PO#q$PO(aVO(y#mi(z#mi~P#EyOn>]O!Q*OO'y*PO(y$}O(z%POP#miR#mi!S#mi!l#mi!p#mi#n#mi#o#mi#p#mi#q#mi(a#mi~P#EyO!]/POg(pX~P!1WOg/RO~Oa$Pi!]$Pi'z$Pi'w$Pi!Y$Pi!k$Piv$Pi!_$Pi%i$Pi!g$Pi~P!:tO$]/SO$_/SO~O$]/TO$_/TO~O!g)hO#`/UO!_$cX$Z$cX$]$cX$_$cX$f$cX~O![/VO~O!_)kO$Z/XO$])jO$_)jO$f/YO~O!]<iO!^(fX~P#BwO!^/ZO~O!g)hO$f({X~O$f/]O~Ov/^O~P!&zOx)yO(b)zO(c/aO~O!S/dO~O(y$}On%aa!Q%aa'y%aa(z%aa!]%aa#`%aa~Og%aa$O%aa~P#L{O(z%POn%ca!Q%ca'y%ca(y%ca!]%ca#`%ca~Og%ca$O%ca~P#MnO!]fX!gfX!kfX!k$zX(rfX~P!0SOp%WO![/mO!](^O(T/lO!Y(vP!Y)PP~P!1uOr*sO!b*qO!c*kO!d*kO!l*bO#[*rO%`*mO(U!lO(VTO(YUO~Os<}O!S/nO![+[O!^*pO(e<|O!^(xP~P$ [O!k/oO~P#/sO!]/pO!g#vO(r'pO!k)OX~O!k/uO~OnoX!QoX'yoX(yoX(zoX~O!g#vO!koX~P$#OOp/wO!S%hO![*^O!_%iO(T%gO!k)OP~O#k/xO~O!Y$zX!]$zX!g%RX~P!0SO!]/yO!Y)PX~P#/sO!g/{O~O!Y/}O~OpkO(T0OO~P.iOh%VOr0TO!g#vO!l%eO(r'pO~O!g+iO~Oa%nO!]0XO'z%nO~O!^0ZO~P!5iO!c0[O!d0[O(U!lO~P#$`Os!nO!S0]O(VTO(YUO(e!mO~O#[0_O~Og%aa!]%aa#`%aa$O%aa~P!1WOg%ca!]%ca#`%ca$O%ca~P!1WOj%dOk%dOl%dO(T&ZOg'mX!]'mX~O!]*yOg(^a~Og0hO~On0jO#`0iOg(_a!](_a~OR0kO!Q0kO!S0lO#S$dOn}a'y}a(y}a(z}a!]}a#`}a~Og}a$O}a~P$(cO!Q*OO'y*POn$sa(y$sa(z$sa!]$sa#`$sa~Og$sa$O$sa~P$)_O!Q*OO'y*POn$ua(y$ua(z$ua!]$ua#`$ua~Og$ua$O$ua~P$*QO#k0oO~Og%Ta!]%Ta#`%Ta$O%Ta~P!1WO!g#vO~O#k0rO~O!]+^Oa)Ta'z)Ta~OR#zO!Q#yO!S#{O!l#xO(aVOP!ri[!rij!rir!ri!]!ri!p!ri#R!ri#n!ri#o!ri#p!ri#q!ri#r!ri#s!ri#t!ri#u!ri#v!ri#x!ri#z!ri#{!ri(r!ri(y!ri(z!ri~Oa!ri'z!ri'w!ri!Y!ri!k!riv!ri!_!ri%i!ri!g!ri~P$+oOh%VOr%XOs$tOt$tOz%YO|%ZO!O<sO!S${O!_$|O!i>VO!l$xO#j<yO$W%`O$t<uO$v<wO$y%aO(VTO(YUO(a$uO(y$}O(z%PO~Op0{O%]0|O(T0zO~P$.VO!g+iOa(]a!_(]a'z(]a!](]a~O#k1SO~O[]X!]fX!^fX~O!]1TO!^)XX~O!^1VO~O[1WO~Ob1YO(T+qO(VTO(YUO~O!_&PO(T%gO`'uX!]'uX~O!]+vO`)Wa~O!k1]O~P!:tO[1`O~O`1aO~O#`1fO~On1iO!_$|O~O(e(|O!^)UP~Oh%VOn1rO!_1oO%i1qO~O[1|O!]1zO!^)VX~O!^1}O~O`2POa%nO'z%nO~O(T#nO(VTO(YUO~O#S$dO#`$eO$Q$eOP(gXR(gX[(gXr(gX!Q(gX!S(gX!](gX!l(gX!p(gX#R(gX#n(gX#o(gX#p(gX#q(gX#r(gX#s(gX#t(gX#u(gX#v(gX#x(gX#z(gX#{(gX(a(gX(r(gX(y(gX(z(gX~Oj2SO&[2TOa(gX~P$3pOj2SO#`$eO&[2TO~Oa2VO~P%[Oa2XO~O&e2[OP&ciQ&ciS&ciY&cia&cid&cie&cil&cip&cir&cis&cit&ciz&ci|&ci!O&ci!S&ci!W&ci!X&ci!_&ci!i&ci!l&ci!o&ci!p&ci!q&ci!s&ci!u&ci!x&ci!|&ci$W&ci$n&ci%h&ci%j&ci%l&ci%m&ci%n&ci%q&ci%s&ci%v&ci%w&ci%y&ci&W&ci&^&ci&`&ci&b&ci&d&ci&g&ci&m&ci&s&ci&u&ci&w&ci&y&ci&{&ci'w&ci(T&ci(V&ci(Y&ci(a&ci(o&ci!^&cib&ci&j&ci~Ob2bO!^2`O&j2aO~P`O!_XO!l2dO~O&q,{OP&liQ&liS&liY&lia&lid&lie&lil&lip&lir&lis&lit&liz&li|&li!O&li!S&li!W&li!X&li!_&li!i&li!l&li!o&li!p&li!q&li!s&li!u&li!x&li!|&li$W&li$n&li%h&li%j&li%l&li%m&li%n&li%q&li%s&li%v&li%w&li%y&li&W&li&^&li&`&li&b&li&d&li&g&li&m&li&s&li&u&li&w&li&y&li&{&li'w&li(T&li(V&li(Y&li(a&li(o&li!^&li&e&lib&li&j&li~O!Y2jO~O!]!aa!^!aa~P#BwOs!nO!S!oO![2pO(e!mO!]'XX!^'XX~P@nO!]-]O!^(ia~O!]'_X!^'_X~P!9|O!]-`O!^(xa~O!^2wO~P'_Oa%nO#`3QO'z%nO~Oa%nO!g#vO#`3QO'z%nO~Oa%nO!g#vO!p3UO#`3QO'z%nO(r'pO~Oa%nO'z%nO~P!:tO!]$_Ov$qa~O!Y'Wi!]'Wi~P!:tO!](VO!Y(hi~O!](^O!Y(vi~O!Y(wi!](wi~P!:tO!](ti!k(tia(ti'z(ti~P!:tO#`3WO!](ti!k(tia(ti'z(ti~O!](jO!k(si~O!S%hO!_%iO!|]O#i3]O#j3[O(T%gO~O!S%hO!_%iO#j3[O(T%gO~On3dO!_'`O%i3cO~Oh%VOn3dO!_'`O%i3cO~O#k%aaP%aaR%aa[%aaa%aaj%aar%aa!S%aa!l%aa!p%aa#R%aa#n%aa#o%aa#p%aa#q%aa#r%aa#s%aa#t%aa#u%aa#v%aa#x%aa#z%aa#{%aa'z%aa(a%aa(r%aa!k%aa!Y%aa'w%aav%aa!_%aa%i%aa!g%aa~P#L{O#k%caP%caR%ca[%caa%caj%car%ca!S%ca!l%ca!p%ca#R%ca#n%ca#o%ca#p%ca#q%ca#r%ca#s%ca#t%ca#u%ca#v%ca#x%ca#z%ca#{%ca'z%ca(a%ca(r%ca!k%ca!Y%ca'w%cav%ca!_%ca%i%ca!g%ca~P#MnO#k%aaP%aaR%aa[%aaa%aaj%aar%aa!S%aa!]%aa!l%aa!p%aa#R%aa#n%aa#o%aa#p%aa#q%aa#r%aa#s%aa#t%aa#u%aa#v%aa#x%aa#z%aa#{%aa'z%aa(a%aa(r%aa!k%aa!Y%aa'w%aa#`%aav%aa!_%aa%i%aa!g%aa~P#/sO#k%caP%caR%ca[%caa%caj%car%ca!S%ca!]%ca!l%ca!p%ca#R%ca#n%ca#o%ca#p%ca#q%ca#r%ca#s%ca#t%ca#u%ca#v%ca#x%ca#z%ca#{%ca'z%ca(a%ca(r%ca!k%ca!Y%ca'w%ca#`%cav%ca!_%ca%i%ca!g%ca~P#/sO#k}aP}a[}aa}aj}ar}a!l}a!p}a#R}a#n}a#o}a#p}a#q}a#r}a#s}a#t}a#u}a#v}a#x}a#z}a#{}a'z}a(a}a(r}a!k}a!Y}a'w}av}a!_}a%i}a!g}a~P$(cO#k$saP$saR$sa[$saa$saj$sar$sa!S$sa!l$sa!p$sa#R$sa#n$sa#o$sa#p$sa#q$sa#r$sa#s$sa#t$sa#u$sa#v$sa#x$sa#z$sa#{$sa'z$sa(a$sa(r$sa!k$sa!Y$sa'w$sav$sa!_$sa%i$sa!g$sa~P$)_O#k$uaP$uaR$ua[$uaa$uaj$uar$ua!S$ua!l$ua!p$ua#R$ua#n$ua#o$ua#p$ua#q$ua#r$ua#s$ua#t$ua#u$ua#v$ua#x$ua#z$ua#{$ua'z$ua(a$ua(r$ua!k$ua!Y$ua'w$uav$ua!_$ua%i$ua!g$ua~P$*QO#k%TaP%TaR%Ta[%Taa%Taj%Tar%Ta!S%Ta!]%Ta!l%Ta!p%Ta#R%Ta#n%Ta#o%Ta#p%Ta#q%Ta#r%Ta#s%Ta#t%Ta#u%Ta#v%Ta#x%Ta#z%Ta#{%Ta'z%Ta(a%Ta(r%Ta!k%Ta!Y%Ta'w%Ta#`%Tav%Ta!_%Ta%i%Ta!g%Ta~P#/sOa#cq!]#cq'z#cq'w#cq!Y#cq!k#cqv#cq!_#cq%i#cq!g#cq~P!:tO![3lO!]'YX!k'YX~P%[O!].tO!k(ka~O!].tO!k(ka~P!:tO!Y3oO~O$O!na!^!na~PKlO$O!ja!]!ja!^!ja~P#BwO$O!ra!^!ra~P!=[O$O!ta!^!ta~P!?rOg']X!]']X~P!,TO!]/POg(pa~OSfO!_4TO$d4UO~O!^4YO~Ov4ZO~P#/sOa$mq!]$mq'z$mq'w$mq!Y$mq!k$mqv$mq!_$mq%i$mq!g$mq~P!:tO!Y4]O~P!&zO!S4^O~O!Q*OO'y*PO(z%POn'ia(y'ia!]'ia#`'ia~Og'ia$O'ia~P%-fO!Q*OO'y*POn'ka(y'ka(z'ka!]'ka#`'ka~Og'ka$O'ka~P%.XO(r$YO~P#/sO!YfX!Y$zX!]fX!]$zX!g%RX#`fX~P!0SOp%WO(T=WO~P!1uOp4bO!S%hO![4aO!_%iO(T%gO!]'eX!k'eX~O!]/pO!k)Oa~O!]/pO!g#vO!k)Oa~O!]/pO!g#vO(r'pO!k)Oa~Og$|i!]$|i#`$|i$O$|i~P!1WO![4jO!Y'gX!]'gX~P!3tO!]/yO!Y)Pa~O!]/yO!Y)Pa~P#/sOP]XR]X[]Xj]Xr]X!Q]X!S]X!Y]X!]]X!l]X!p]X#R]X#S]X#`]X#kfX#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#x]X#z]X#{]X$Q]X(a]X(r]X(y]X(z]X~Oj%YX!g%YX~P%2OOj4oO!g#vO~Oh%VO!g#vO!l%eO~Oh%VOr4tO!l%eO(r'pO~Or4yO!g#vO(r'pO~Os!nO!S4zO(VTO(YUO(e!mO~O(y$}On%ai!Q%ai'y%ai(z%ai!]%ai#`%ai~Og%ai$O%ai~P%5oO(z%POn%ci!Q%ci'y%ci(y%ci!]%ci#`%ci~Og%ci$O%ci~P%6bOg(_i!](_i~P!1WO#`5QOg(_i!](_i~P!1WO!k5VO~Oa$oq!]$oq'z$oq'w$oq!Y$oq!k$oqv$oq!_$oq%i$oq!g$oq~P!:tO!Y5ZO~O!]5[O!_)QX~P#/sOa$zX!_$zX%^]X'z$zX!]$zX~P!0SO%^5_OaoX!_oX'zoX!]oX~P$#OOp5`O(T#nO~O%^5_O~Ob5fO%j5gO(T+qO(VTO(YUO!]'tX!^'tX~O!]1TO!^)Xa~O[5kO~O`5lO~O[5pO~Oa%nO'z%nO~P#/sO!]5uO#`5wO!^)UX~O!^5xO~Or6OOs!nO!S*iO!b!yO!c!vO!d!vO!|<VO#T!pO#U!pO#V!pO#W!pO#X!pO#[5}O#]!zO(U!lO(VTO(YUO(e!mO(o!sO~O!^5|O~P%;eOn6TO!_1oO%i6SO~Oh%VOn6TO!_1oO%i6SO~Ob6[O(T#nO(VTO(YUO!]'sX!^'sX~O!]1zO!^)Va~O(VTO(YUO(e6^O~O`6bO~Oj6eO&[6fO~PNXO!k6gO~P%[Oa6iO~Oa6iO~P%[Ob2bO!^6nO&j2aO~P`O!g6pO~O!g6rOh(ji!](ji!^(ji!g(ji!l(jir(ji(r(ji~O!]#hi!^#hi~P#BwO#`6sO!]#hi!^#hi~O!]!ai!^!ai~P#BwOa%nO#`6|O'z%nO~Oa%nO!g#vO#`6|O'z%nO~O!](tq!k(tqa(tq'z(tq~P!:tO!](jO!k(sq~O!S%hO!_%iO#j7TO(T%gO~O!_'`O%i7WO~On7[O!_'`O%i7WO~O#k'iaP'iaR'ia['iaa'iaj'iar'ia!S'ia!l'ia!p'ia#R'ia#n'ia#o'ia#p'ia#q'ia#r'ia#s'ia#t'ia#u'ia#v'ia#x'ia#z'ia#{'ia'z'ia(a'ia(r'ia!k'ia!Y'ia'w'iav'ia!_'ia%i'ia!g'ia~P%-fO#k'kaP'kaR'ka['kaa'kaj'kar'ka!S'ka!l'ka!p'ka#R'ka#n'ka#o'ka#p'ka#q'ka#r'ka#s'ka#t'ka#u'ka#v'ka#x'ka#z'ka#{'ka'z'ka(a'ka(r'ka!k'ka!Y'ka'w'kav'ka!_'ka%i'ka!g'ka~P%.XO#k$|iP$|iR$|i[$|ia$|ij$|ir$|i!S$|i!]$|i!l$|i!p$|i#R$|i#n$|i#o$|i#p$|i#q$|i#r$|i#s$|i#t$|i#u$|i#v$|i#x$|i#z$|i#{$|i'z$|i(a$|i(r$|i!k$|i!Y$|i'w$|i#`$|iv$|i!_$|i%i$|i!g$|i~P#/sO#k%aiP%aiR%ai[%aia%aij%air%ai!S%ai!l%ai!p%ai#R%ai#n%ai#o%ai#p%ai#q%ai#r%ai#s%ai#t%ai#u%ai#v%ai#x%ai#z%ai#{%ai'z%ai(a%ai(r%ai!k%ai!Y%ai'w%aiv%ai!_%ai%i%ai!g%ai~P%5oO#k%ciP%ciR%ci[%cia%cij%cir%ci!S%ci!l%ci!p%ci#R%ci#n%ci#o%ci#p%ci#q%ci#r%ci#s%ci#t%ci#u%ci#v%ci#x%ci#z%ci#{%ci'z%ci(a%ci(r%ci!k%ci!Y%ci'w%civ%ci!_%ci%i%ci!g%ci~P%6bO!]'Ya!k'Ya~P!:tO!].tO!k(ki~O$O#ci!]#ci!^#ci~P#BwOP$[OR#zO!Q#yO!S#{O!l#xO!p$[O(aVO[#mij#mir#mi#R#mi#o#mi#p#mi#q#mi#r#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi$O#mi(r#mi(y#mi(z#mi!]#mi!^#mi~O#n#mi~P%NdO#n<_O~P%NdOP$[OR#zOr<kO!Q#yO!S#{O!l#xO!p$[O#n<_O#o<`O#p<`O#q<`O(aVO[#mij#mi#R#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi$O#mi(r#mi(y#mi(z#mi!]#mi!^#mi~O#r#mi~P&!lO#r<aO~P&!lOP$[OR#zO[<mOj<bOr<kO!Q#yO!S#{O!l#xO!p$[O#R<bO#n<_O#o<`O#p<`O#q<`O#r<aO#s<bO#t<bO#u<lO(aVO#x#mi#z#mi#{#mi$O#mi(r#mi(y#mi(z#mi!]#mi!^#mi~O#v#mi~P&$tOP$[OR#zO[<mOj<bOr<kO!Q#yO!S#{O!l#xO!p$[O#R<bO#n<_O#o<`O#p<`O#q<`O#r<aO#s<bO#t<bO#u<lO#v<cO(aVO(z#}O#z#mi#{#mi$O#mi(r#mi(y#mi!]#mi!^#mi~O#x<eO~P&&uO#x#mi~P&&uO#v<cO~P&$tOP$[OR#zO[<mOj<bOr<kO!Q#yO!S#{O!l#xO!p$[O#R<bO#n<_O#o<`O#p<`O#q<`O#r<aO#s<bO#t<bO#u<lO#v<cO#x<eO(aVO(y#|O(z#}O#{#mi$O#mi(r#mi!]#mi!^#mi~O#z#mi~P&)UO#z<gO~P&)UOa#|y!]#|y'z#|y'w#|y!Y#|y!k#|yv#|y!_#|y%i#|y!g#|y~P!:tO[#mij#mir#mi#R#mi#r#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi$O#mi(r#mi!]#mi!^#mi~OP$[OR#zO!Q#yO!S#{O!l#xO!p$[O#n<_O#o<`O#p<`O#q<`O(aVO(y#mi(z#mi~P&,QOn>^O!Q*OO'y*PO(y$}O(z%POP#miR#mi!S#mi!l#mi!p#mi#n#mi#o#mi#p#mi#q#mi(a#mi~P&,QO#S$dOP(`XR(`X[(`Xj(`Xn(`Xr(`X!Q(`X!S(`X!l(`X!p(`X#R(`X#n(`X#o(`X#p(`X#q(`X#r(`X#s(`X#t(`X#u(`X#v(`X#x(`X#z(`X#{(`X$O(`X'y(`X(a(`X(r(`X(y(`X(z(`X!](`X!^(`X~O$O$Pi!]$Pi!^$Pi~P#BwO$O!ri!^!ri~P$+oOg']a!]']a~P!1WO!^7nO~O!]'da!^'da~P#BwO!Y7oO~P#/sO!g#vO(r'pO!]'ea!k'ea~O!]/pO!k)Oi~O!]/pO!g#vO!k)Oi~Og$|q!]$|q#`$|q$O$|q~P!1WO!Y'ga!]'ga~P#/sO!g7vO~O!]/yO!Y)Pi~P#/sO!]/yO!Y)Pi~O!Y7yO~Oh%VOr8OO!l%eO(r'pO~Oj8QO!g#vO~Or8TO!g#vO(r'pO~O!Q*OO'y*PO(z%POn'ja(y'ja!]'ja#`'ja~Og'ja$O'ja~P&5RO!Q*OO'y*POn'la(y'la(z'la!]'la#`'la~Og'la$O'la~P&5tOg(_q!](_q~P!1WO#`8VOg(_q!](_q~P!1WO!Y8WO~Og%Oq!]%Oq#`%Oq$O%Oq~P!1WOa$oy!]$oy'z$oy'w$oy!Y$oy!k$oyv$oy!_$oy%i$oy!g$oy~P!:tO!g6rO~O!]5[O!_)Qa~O!_'`OP$TaR$Ta[$Taj$Tar$Ta!Q$Ta!S$Ta!]$Ta!l$Ta!p$Ta#R$Ta#n$Ta#o$Ta#p$Ta#q$Ta#r$Ta#s$Ta#t$Ta#u$Ta#v$Ta#x$Ta#z$Ta#{$Ta(a$Ta(r$Ta(y$Ta(z$Ta~O%i7WO~P&8fO%^8[Oa%[i!_%[i'z%[i!]%[i~Oa#cy!]#cy'z#cy'w#cy!Y#cy!k#cyv#cy!_#cy%i#cy!g#cy~P!:tO[8^O~Ob8`O(T+qO(VTO(YUO~O!]1TO!^)Xi~O`8dO~O(e(|O!]'pX!^'pX~O!]5uO!^)Ua~O!^8nO~P%;eO(o!sO~P$&YO#[8oO~O!_1oO~O!_1oO%i8qO~On8tO!_1oO%i8qO~O[8yO!]'sa!^'sa~O!]1zO!^)Vi~O!k8}O~O!k9OO~O!k9RO~O!k9RO~P%[Oa9TO~O!g9UO~O!k9VO~O!](wi!^(wi~P#BwOa%nO#`9_O'z%nO~O!](ty!k(tya(ty'z(ty~P!:tO!](jO!k(sy~O%i9bO~P&8fO!_'`O%i9bO~O#k$|qP$|qR$|q[$|qa$|qj$|qr$|q!S$|q!]$|q!l$|q!p$|q#R$|q#n$|q#o$|q#p$|q#q$|q#r$|q#s$|q#t$|q#u$|q#v$|q#x$|q#z$|q#{$|q'z$|q(a$|q(r$|q!k$|q!Y$|q'w$|q#`$|qv$|q!_$|q%i$|q!g$|q~P#/sO#k'jaP'jaR'ja['jaa'jaj'jar'ja!S'ja!l'ja!p'ja#R'ja#n'ja#o'ja#p'ja#q'ja#r'ja#s'ja#t'ja#u'ja#v'ja#x'ja#z'ja#{'ja'z'ja(a'ja(r'ja!k'ja!Y'ja'w'jav'ja!_'ja%i'ja!g'ja~P&5RO#k'laP'laR'la['laa'laj'lar'la!S'la!l'la!p'la#R'la#n'la#o'la#p'la#q'la#r'la#s'la#t'la#u'la#v'la#x'la#z'la#{'la'z'la(a'la(r'la!k'la!Y'la'w'lav'la!_'la%i'la!g'la~P&5tO#k%OqP%OqR%Oq[%Oqa%Oqj%Oqr%Oq!S%Oq!]%Oq!l%Oq!p%Oq#R%Oq#n%Oq#o%Oq#p%Oq#q%Oq#r%Oq#s%Oq#t%Oq#u%Oq#v%Oq#x%Oq#z%Oq#{%Oq'z%Oq(a%Oq(r%Oq!k%Oq!Y%Oq'w%Oq#`%Oqv%Oq!_%Oq%i%Oq!g%Oq~P#/sO!]'Yi!k'Yi~P!:tO$O#cq!]#cq!^#cq~P#BwO(y$}OP%aaR%aa[%aaj%aar%aa!S%aa!l%aa!p%aa#R%aa#n%aa#o%aa#p%aa#q%aa#r%aa#s%aa#t%aa#u%aa#v%aa#x%aa#z%aa#{%aa$O%aa(a%aa(r%aa!]%aa!^%aa~On%aa!Q%aa'y%aa(z%aa~P&IyO(z%POP%caR%ca[%caj%car%ca!S%ca!l%ca!p%ca#R%ca#n%ca#o%ca#p%ca#q%ca#r%ca#s%ca#t%ca#u%ca#v%ca#x%ca#z%ca#{%ca$O%ca(a%ca(r%ca!]%ca!^%ca~On%ca!Q%ca'y%ca(y%ca~P&LQOn>^O!Q*OO'y*PO(z%PO~P&IyOn>^O!Q*OO'y*PO(y$}O~P&LQOR0kO!Q0kO!S0lO#S$dOP}a[}aj}an}ar}a!l}a!p}a#R}a#n}a#o}a#p}a#q}a#r}a#s}a#t}a#u}a#v}a#x}a#z}a#{}a$O}a'y}a(a}a(r}a(y}a(z}a!]}a!^}a~O!Q*OO'y*POP$saR$sa[$saj$san$sar$sa!S$sa!l$sa!p$sa#R$sa#n$sa#o$sa#p$sa#q$sa#r$sa#s$sa#t$sa#u$sa#v$sa#x$sa#z$sa#{$sa$O$sa(a$sa(r$sa(y$sa(z$sa!]$sa!^$sa~O!Q*OO'y*POP$uaR$ua[$uaj$uan$uar$ua!S$ua!l$ua!p$ua#R$ua#n$ua#o$ua#p$ua#q$ua#r$ua#s$ua#t$ua#u$ua#v$ua#x$ua#z$ua#{$ua$O$ua(a$ua(r$ua(y$ua(z$ua!]$ua!^$ua~On>^O!Q*OO'y*PO(y$}O(z%PO~OP%TaR%Ta[%Taj%Tar%Ta!S%Ta!l%Ta!p%Ta#R%Ta#n%Ta#o%Ta#p%Ta#q%Ta#r%Ta#s%Ta#t%Ta#u%Ta#v%Ta#x%Ta#z%Ta#{%Ta$O%Ta(a%Ta(r%Ta!]%Ta!^%Ta~P''VO$O$mq!]$mq!^$mq~P#BwO$O$oq!]$oq!^$oq~P#BwO!^9oO~O$O9pO~P!1WO!g#vO!]'ei!k'ei~O!g#vO(r'pO!]'ei!k'ei~O!]/pO!k)Oq~O!Y'gi!]'gi~P#/sO!]/yO!Y)Pq~Or9wO!g#vO(r'pO~O[9yO!Y9xO~P#/sO!Y9xO~Oj:PO!g#vO~Og(_y!](_y~P!1WO!]'na!_'na~P#/sOa%[q!_%[q'z%[q!]%[q~P#/sO[:UO~O!]1TO!^)Xq~O`:YO~O#`:ZO!]'pa!^'pa~O!]5uO!^)Ui~P#BwO!S:]O~O!_1oO%i:`O~O(VTO(YUO(e:eO~O!]1zO!^)Vq~O!k:hO~O!k:iO~O!k:jO~O!k:jO~P%[O#`:mO!]#hy!^#hy~O!]#hy!^#hy~P#BwO%i:rO~P&8fO!_'`O%i:rO~O$O#|y!]#|y!^#|y~P#BwOP$|iR$|i[$|ij$|ir$|i!S$|i!l$|i!p$|i#R$|i#n$|i#o$|i#p$|i#q$|i#r$|i#s$|i#t$|i#u$|i#v$|i#x$|i#z$|i#{$|i$O$|i(a$|i(r$|i!]$|i!^$|i~P''VO!Q*OO'y*PO(z%POP'iaR'ia['iaj'ian'iar'ia!S'ia!l'ia!p'ia#R'ia#n'ia#o'ia#p'ia#q'ia#r'ia#s'ia#t'ia#u'ia#v'ia#x'ia#z'ia#{'ia$O'ia(a'ia(r'ia(y'ia!]'ia!^'ia~O!Q*OO'y*POP'kaR'ka['kaj'kan'kar'ka!S'ka!l'ka!p'ka#R'ka#n'ka#o'ka#p'ka#q'ka#r'ka#s'ka#t'ka#u'ka#v'ka#x'ka#z'ka#{'ka$O'ka(a'ka(r'ka(y'ka(z'ka!]'ka!^'ka~O(y$}OP%aiR%ai[%aij%ain%air%ai!Q%ai!S%ai!l%ai!p%ai#R%ai#n%ai#o%ai#p%ai#q%ai#r%ai#s%ai#t%ai#u%ai#v%ai#x%ai#z%ai#{%ai$O%ai'y%ai(a%ai(r%ai(z%ai!]%ai!^%ai~O(z%POP%ciR%ci[%cij%cin%cir%ci!Q%ci!S%ci!l%ci!p%ci#R%ci#n%ci#o%ci#p%ci#q%ci#r%ci#s%ci#t%ci#u%ci#v%ci#x%ci#z%ci#{%ci$O%ci'y%ci(a%ci(r%ci(y%ci!]%ci!^%ci~O$O$oy!]$oy!^$oy~P#BwO$O#cy!]#cy!^#cy~P#BwO!g#vO!]'eq!k'eq~O!]/pO!k)Oy~O!Y'gq!]'gq~P#/sOr:|O!g#vO(r'pO~O[;QO!Y;PO~P#/sO!Y;PO~Og(_!R!](_!R~P!1WOa%[y!_%[y'z%[y!]%[y~P#/sO!]1TO!^)Xy~O!]5uO!^)Uq~O(T;XO~O!_1oO%i;[O~O!k;_O~O%i;dO~P&8fOP$|qR$|q[$|qj$|qr$|q!S$|q!l$|q!p$|q#R$|q#n$|q#o$|q#p$|q#q$|q#r$|q#s$|q#t$|q#u$|q#v$|q#x$|q#z$|q#{$|q$O$|q(a$|q(r$|q!]$|q!^$|q~P''VO!Q*OO'y*PO(z%POP'jaR'ja['jaj'jan'jar'ja!S'ja!l'ja!p'ja#R'ja#n'ja#o'ja#p'ja#q'ja#r'ja#s'ja#t'ja#u'ja#v'ja#x'ja#z'ja#{'ja$O'ja(a'ja(r'ja(y'ja!]'ja!^'ja~O!Q*OO'y*POP'laR'la['laj'lan'lar'la!S'la!l'la!p'la#R'la#n'la#o'la#p'la#q'la#r'la#s'la#t'la#u'la#v'la#x'la#z'la#{'la$O'la(a'la(r'la(y'la(z'la!]'la!^'la~OP%OqR%Oq[%Oqj%Oqr%Oq!S%Oq!l%Oq!p%Oq#R%Oq#n%Oq#o%Oq#p%Oq#q%Oq#r%Oq#s%Oq#t%Oq#u%Oq#v%Oq#x%Oq#z%Oq#{%Oq$O%Oq(a%Oq(r%Oq!]%Oq!^%Oq~P''VOg%e!Z!]%e!Z#`%e!Z$O%e!Z~P!1WO!Y;hO~P#/sOr;iO!g#vO(r'pO~O[;kO!Y;hO~P#/sO!]'pq!^'pq~P#BwO!]#h!Z!^#h!Z~P#BwO#k%e!ZP%e!ZR%e!Z[%e!Za%e!Zj%e!Zr%e!Z!S%e!Z!]%e!Z!l%e!Z!p%e!Z#R%e!Z#n%e!Z#o%e!Z#p%e!Z#q%e!Z#r%e!Z#s%e!Z#t%e!Z#u%e!Z#v%e!Z#x%e!Z#z%e!Z#{%e!Z'z%e!Z(a%e!Z(r%e!Z!k%e!Z!Y%e!Z'w%e!Z#`%e!Zv%e!Z!_%e!Z%i%e!Z!g%e!Z~P#/sOr;tO!g#vO(r'pO~O!Y;uO~P#/sOr;|O!g#vO(r'pO~O!Y;}O~P#/sOP%e!ZR%e!Z[%e!Zj%e!Zr%e!Z!S%e!Z!l%e!Z!p%e!Z#R%e!Z#n%e!Z#o%e!Z#p%e!Z#q%e!Z#r%e!Z#s%e!Z#t%e!Z#u%e!Z#v%e!Z#x%e!Z#z%e!Z#{%e!Z$O%e!Z(a%e!Z(r%e!Z!]%e!Z!^%e!Z~P''VOr<QO!g#vO(r'pO~Ov(fX~P1qO!Q%rO~P!)[O(U!lO~P!)[O!YfX!]fX#`fX~P%2OOP]XR]X[]Xj]Xr]X!Q]X!S]X!]]X!]fX!l]X!p]X#R]X#S]X#`]X#`fX#kfX#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#x]X#z]X#{]X$Q]X(a]X(r]X(y]X(z]X~O!gfX!k]X!kfX(rfX~P'LTOP<UOQ<UOSfOd>ROe!iOpkOr<UOskOtkOzkO|<UO!O<UO!SWO!WkO!XkO!_XO!i<XO!lZO!o<UO!p<UO!q<UO!s<YO!u<]O!x!hO$W!kO$n>PO(T)]O(VTO(YUO(aVO(o[O~O!]<iO!^$qa~Oh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O<tO!S${O!_$|O!i>WO!l$xO#j<zO$W%`O$t<vO$v<xO$y%aO(T(vO(VTO(YUO(a$uO(y$}O(z%PO~Ol)dO~P(!yOr!eX(r!eX~P#!iOr(jX(r(jX~P##[O!^]X!^fX~P'LTO!YfX!Y$zX!]fX!]$zX#`fX~P!0SO#k<^O~O!g#vO#k<^O~O#`<nO~Oj<bO~O#`=OO!](wX!^(wX~O#`<nO!](uX!^(uX~O#k=PO~Og=RO~P!1WO#k=XO~O#k=YO~Og=RO(T&ZO~O!g#vO#k=ZO~O!g#vO#k=PO~O$O=[O~P#BwO#k=]O~O#k=^O~O#k=cO~O#k=dO~O#k=eO~O#k=fO~O$O=gO~P!1WO$O=hO~P!1WOl=sO~P7eOk#S#T#U#W#X#[#i#j#u$n$t$v$y%]%^%h%i%j%q%s%v%w%y%{~(OT#o!X'|(U#ps#n#qr!Q'}$]'}(T$_(e~",
  goto: "$9Y)]PPPPPP)^PP)aP)rP+W/]PPPP6mPP7TPP=QPPP@tPA^PA^PPPA^PCfPA^PA^PA^PCjPCoPD^PIWPPPI[PPPPI[L_PPPLeMVPI[PI[PP! eI[PPPI[PI[P!#lI[P!'S!(X!(bP!)U!)Y!)U!,gPPPPPPP!-W!(XPP!-h!/YP!2iI[I[!2n!5z!:h!:h!>gPPP!>oI[PPPPPPPPP!BOP!C]PPI[!DnPI[PI[I[I[I[I[PI[!FQP!I[P!LbP!Lf!Lp!Lt!LtP!IXP!Lx!LxP#!OP#!SI[PI[#!Y#%_CjA^PA^PA^A^P#&lA^A^#)OA^#+vA^#.SA^A^#.r#1W#1W#1]#1f#1W#1qPP#1WPA^#2ZA^#6YA^A^6mPPP#:_PPP#:x#:xP#:xP#;`#:xPP#;fP#;]P#;]#;y#;]#<e#<k#<n)aP#<q)aP#<z#<z#<zP)aP)aP)aP)aPP)aP#=Q#=TP#=T)aP#=XP#=[P)aP)aP)aP)aP)aP)a)aPP#=b#=h#=s#=y#>P#>V#>]#>k#>q#>{#?R#?]#?c#?s#?y#@k#@}#AT#AZ#Ai#BO#Cs#DR#DY#Et#FS#Gt#HS#HY#H`#Hf#Hp#Hv#H|#IW#Ij#IpPPPPPPPPPPP#IvPPPPPPP#Jk#Mx$ b$ i$ qPPP$']P$'f$*_$0x$0{$1O$1}$2Q$2X$2aP$2g$2jP$3W$3[$4S$5b$5g$5}PP$6S$6Y$6^$6a$6e$6i$7e$7|$8e$8i$8l$8o$8y$8|$9Q$9UR!|RoqOXst!Z#d%m&r&t&u&w,s,x2[2_Y!vQ'`-e1o5{Q%tvQ%|yQ&T|Q&j!VS'W!e-]Q'f!iS'l!r!yU*k$|*Z*oQ+o%}S+|&V&WQ,d&dQ-c'_Q-m'gQ-u'mQ0[*qQ1b,OQ1y,eR<{<Y%SdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+],p,s,x-i-q.P.V.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3l4z6T6e6f6i6|8t9T9_S#q]<V!r)_$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SU+P%]<s<tQ+t&PQ,f&gQ,m&oQ0x+gQ0}+iQ1Y+uQ2R,kQ3`.gQ5`0|Q5f1TQ6[1zQ7Y3dQ8`5gR9e7['QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>S!S!nQ!r!v!y!z$|'W'_'`'l'm'n*k*o*q*r-]-c-e-u0[0_1o5{5}%[$ti#v$b$c$d$x${%O%Q%^%_%c)y*R*T*V*Y*a*g*w*x+f+i,S,V.f/P/d/m/x/y/{0`0b0i0j0o1f1i1q3c4^4_4j4o5Q5[5_6S7W7v8Q8V8[8q9b9p9y:P:`:r;Q;[;d;k<l<m<o<p<q<r<u<v<w<x<y<z=S=T=U=V=X=Y=]=^=_=`=a=b=c=d=g=h>P>X>Y>]>^Q&X|Q'U!eS'[%i-`Q+t&PQ,P&WQ,f&gQ0n+SQ1Y+uQ1_+{Q2Q,jQ2R,kQ5f1TQ5o1aQ6[1zQ6_1|Q6`2PQ8`5gQ8c5lQ8|6bQ:X8dQ:f8yQ;V:YR<}*ZrnOXst!V!Z#d%m&i&r&t&u&w,s,x2[2_R,h&k&z^OPXYstuvwz!Z!`!g!j!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'b'r(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>R>S[#]WZ#W#Z'X(T!b%jm#h#i#l$x%e%h(^(h(i(j*Y*^*b+Z+[+^,o-V.T.Z.[.]._/m/p2d3[3]4a6r7TQ%wxQ%{yW&Q|&V&W,OQ&_!TQ'c!hQ'e!iQ(q#sS+n%|%}Q+r&PQ,_&bQ,c&dS-l'f'gQ.i(rQ1R+oQ1X+uQ1Z+vQ1^+zQ1t,`S1x,d,eQ2|-mQ5e1TQ5i1WQ5n1`Q6Z1yQ8_5gQ8b5kQ8f5pQ:T8^R;T:U!U$zi$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Y!^%yy!i!u%{%|%}'V'e'f'g'k'u*j+n+o-Y-l-m-t0R0U1R2u2|3T4r4s4v7}9{Q+h%wQ,T&[Q,W&]Q,b&dQ.h(qQ1s,_U1w,c,d,eQ3e.iQ6U1tS6Y1x1yQ8x6Z#f>T#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^o>U<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=hW%Ti%V*y>PS&[!Q&iQ&]!RQ&^!SU*}%[%d=sR,R&Y%]%Si#v$b$c$d$x${%O%Q%^%_%c)y*R*T*V*Y*a*g*w*x+f+i,S,V.f/P/d/m/x/y/{0`0b0i0j0o1f1i1q3c4^4_4j4o5Q5[5_6S7W7v8Q8V8[8q9b9p9y:P:`:r;Q;[;d;k<l<m<o<p<q<r<u<v<w<x<y<z=S=T=U=V=X=Y=]=^=_=`=a=b=c=d=g=h>P>X>Y>]>^T)z$u){V+P%]<s<tW'[!e%i*Z-`S(}#y#zQ+c%rQ+y&SS.b(m(nQ1j,XQ5T0kR8i5u'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>S$i$^c#Y#e%q%s%u(S(Y(t(y)R)S)T)U)V)W)X)Y)Z)[)^)`)b)g)q+d+x-Z-x-}.S.U.s.v.z.|.}/O/b0p2k2n3O3V3k3p3q3r3s3t3u3v3w3x3y3z3{3|4P4Q4X5X5c6u6{7Q7a7b7k7l8k9X9]9g9m9n:o;W;`<W=vT#TV#U'RkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SQ'Y!eR2q-]!W!nQ!e!r!v!y!z$|'W'_'`'l'm'n*Z*k*o*q*r-]-c-e-u0[0_1o5{5}R1l,ZnqOXst!Z#d%m&r&t&u&w,s,x2[2_Q&y!^Q'v!xS(s#u<^Q+l%zQ,]&_Q,^&aQ-j'dQ-w'oS.r(x=PS0q+X=ZQ1P+mQ1n,[Q2c,zQ2e,{Q2m-WQ2z-kQ2}-oS5Y0r=eQ5a1QS5d1S=fQ6t2oQ6x2{Q6}3SQ8]5bQ9Y6vQ9Z6yQ9^7OR:l9V$d$]c#Y#e%s%u(S(Y(t(y)R)S)T)U)V)W)X)Y)Z)[)^)`)b)g)q+d+x-Z-x-}.S.U.s.v.z.}/O/b0p2k2n3O3V3k3p3q3r3s3t3u3v3w3x3y3z3{3|4P4Q4X5X5c6u6{7Q7a7b7k7l8k9X9]9g9m9n:o;W;`<W=vS(o#p'iQ)P#zS+b%q.|S.c(n(pR3^.d'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SS#q]<VQ&t!XQ&u!YQ&w![Q&x!]R2Z,vQ'a!hQ+e%wQ-h'cS.e(q+hQ2x-gW3b.h.i0w0yQ6w2yW7U3_3a3e5^U9a7V7X7ZU:q9c9d9fS;b:p:sQ;p;cR;x;qU!wQ'`-eT5y1o5{!Q_OXZ`st!V!Z#d#h%e%m&i&k&r&t&u&w(j,s,x.[2[2_]!pQ!r'`-e1o5{T#q]<V%^{OPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_S(}#y#zS.b(m(n!s=l$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SU$fd)_,mS(p#p'iU*v%R(w4OU0m+O.n7gQ5^0xQ7V3`Q9d7YR:s9em!tQ!r!v!y!z'`'l'm'n-e-u1o5{5}Q't!uS(f#g2US-s'k'wQ/s*]Q0R*jQ3U-vQ4f/tQ4r0TQ4s0UQ4x0^Q7r4`S7}4t4vS8R4y4{Q9r7sQ9v7yQ9{8OQ:Q8TS:{9w9xS;g:|;PS;s;h;iS;{;t;uS<P;|;}R<S<QQ#wbQ's!uS(e#g2US(g#m+WQ+Y%fQ+j%xQ+p&OU-r'k't'wQ.W(fU/r*]*`/wQ0S*jQ0V*lQ1O+kQ1u,aS3R-s-vQ3Z.`S4e/s/tQ4n0PS4q0R0^Q4u0WQ6W1vQ7P3US7q4`4bQ7u4fU7|4r4x4{Q8P4wQ8v6XS9q7r7sQ9u7yQ9}8RQ:O8SQ:c8wQ:y9rS:z9v9xQ;S:QQ;^:dS;f:{;PS;r;g;hS;z;s;uS<O;{;}Q<R<PQ<T<SQ=o=jQ={=tR=|=uV!wQ'`-e%^aOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_S#wz!j!r=i$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SR=o>R%^bOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_Q%fj!^%xy!i!u%{%|%}'V'e'f'g'k'u*j+n+o-Y-l-m-t0R0U1R2u2|3T4r4s4v7}9{S&Oz!jQ+k%yQ,a&dW1v,b,c,d,eU6X1w1x1yS8w6Y6ZQ:d8x!r=j$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SQ=t>QR=u>R%QeOPXYstuvw!Z!`!g!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&r&t&u&w&{'T'b'r(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_Y#bWZ#W#Z(T!b%jm#h#i#l$x%e%h(^(h(i(j*Y*^*b+Z+[+^,o-V.T.Z.[.]._/m/p2d3[3]4a6r7TQ,n&o!p=k$Z$n)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SR=n'XU']!e%i*ZR2s-`%SdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+],p,s,x-i-q.P.V.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3l4z6T6e6f6i6|8t9T9_!r)_$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SQ,m&oQ0x+gQ3`.gQ7Y3dR9e7[!b$Tc#Y%q(S(Y(t(y)Z)[)`)g+x-x-}.S.U.s.v/b0p3O3V3k3{5X5c6{7Q7a9]:o<W!P<d)^)q-Z.|2k2n3p3y3z4P4X6u7b7k7l8k9X9g9m9n;W;`=v!f$Vc#Y%q(S(Y(t(y)W)X)Z)[)`)g+x-x-}.S.U.s.v/b0p3O3V3k3{5X5c6{7Q7a9]:o<W!T<f)^)q-Z.|2k2n3p3v3w3y3z4P4X6u7b7k7l8k9X9g9m9n;W;`=v!^$Zc#Y%q(S(Y(t(y)`)g+x-x-}.S.U.s.v/b0p3O3V3k3{5X5c6{7Q7a9]:o<WQ4_/kz>S)^)q-Z.|2k2n3p4P4X6u7b7k7l8k9X9g9m9n;W;`=vQ>X>ZR>Y>['QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SS$oh$pR4U/U'XgOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/U/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>ST$kf$qQ$ifS)j$l)nR)v$qT$jf$qT)l$l)n'XhOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/U/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>ST$oh$pQ$rhR)u$p%^jOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_!s>Q$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>S#glOPXZst!Z!`!o#S#d#o#{$n%m&k&n&o&r&t&u&w&{'T'b)O)s*i+]+g,p,s,x-i.g/V/n0]0l1r2S2T2V2X2[2_2a3d4T4z6T6e6f6i7[8t9T!U%Ri$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Y#f(w#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^Q+T%aQ/c*Oo4O<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=h!U$yi$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>YQ*c$zU*l$|*Z*oQ+U%bQ0W*m#f=q#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^n=r<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=hQ=w>TQ=x>UQ=y>VR=z>W!U%Ri$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Y#f(w#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^o4O<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=hnoOXst!Z#d%m&r&t&u&w,s,x2[2_S*f${*YQ-R'OQ-S'QR4i/y%[%Si#v$b$c$d$x${%O%Q%^%_%c)y*R*T*V*Y*a*g*w*x+f+i,S,V.f/P/d/m/x/y/{0`0b0i0j0o1f1i1q3c4^4_4j4o5Q5[5_6S7W7v8Q8V8[8q9b9p9y:P:`:r;Q;[;d;k<l<m<o<p<q<r<u<v<w<x<y<z=S=T=U=V=X=Y=]=^=_=`=a=b=c=d=g=h>P>X>Y>]>^Q,U&]Q1h,WQ5s1gR8h5tV*n$|*Z*oU*n$|*Z*oT5z1o5{S0P*i/nQ4w0]T8S4z:]Q+j%xQ0V*lQ1O+kQ1u,aQ6W1vQ8v6XQ:c8wR;^:d!U%Oi$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Yx*R$v)e*S*u+V/v0d0e4R4g5R5S5W7p8U:R:x=p=}>OS0`*t0a#f<o#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^n<p<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=h!d=S(u)c*[*e.j.m.q/_/k/|0v1e3h4[4h4l5r7]7`7w7z8X8Z9t9|:S:};R;e;j;v>Z>[`=T3}7c7f7j9h:t:w;yS=_.l3iT=`7e9k!U%Qi$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Y|*T$v)e*U*t+V/g/v0d0e4R4g4|5R5S5W7p8U:R:x=p=}>OS0b*u0c#f<q#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^n<r<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=h!h=U(u)c*[*e.k.l.q/_/k/|0v1e3f3h4[4h4l5r7]7^7`7w7z8X8Z9t9|:S:};R;e;j;v>Z>[d=V3}7d7e7j9h9i:t:u:w;yS=a.m3jT=b7f9lrnOXst!V!Z#d%m&i&r&t&u&w,s,x2[2_Q&f!UR,p&ornOXst!V!Z#d%m&i&r&t&u&w,s,x2[2_R&f!UQ,Y&^R1d,RsnOXst!V!Z#d%m&i&r&t&u&w,s,x2[2_Q1p,_S6R1s1tU8p6P6Q6US:_8r8sS;Y:^:aQ;m;ZR;w;nQ&m!VR,i&iR6_1|R:f8yW&Q|&V&W,OR1Z+vQ&r!WR,s&sR,y&xT2],x2_R,}&yQ,|&yR2f,}Q'y!{R-y'ySsOtQ#dXT%ps#dQ#OTR'{#OQ#RUR'}#RQ){$uR/`){Q#UVR(Q#UQ#XWU(W#X(X.QQ(X#YR.Q(YQ-^'YR2r-^Q.u(yS3m.u3nR3n.vQ-e'`R2v-eY!rQ'`-e1o5{R'j!rQ/Q)eR4S/QU#_W%h*YU(_#_(`.RQ(`#`R.R(ZQ-a']R2t-at`OXst!V!Z#d%m&i&k&r&t&u&w,s,x2[2_S#hZ%eU#r`#h.[R.[(jQ(k#jQ.X(gW.a(k.X3X7RQ3X.YR7R3YQ)n$lR/W)nQ$phR)t$pQ$`cU)a$`-|<jQ-|<WR<j)qQ/q*]W4c/q4d7t9sU4d/r/s/tS7t4e4fR9s7u$e*Q$v(u)c)e*[*e*t*u+Q+R+V.l.m.o.p.q/_/g/i/k/v/|0d0e0v1e3f3g3h3}4R4[4g4h4l4|5O5R5S5W5r7]7^7_7`7e7f7h7i7j7p7w7z8U8X8Z9h9i9j9t9|:R:S:t:u:v:w:x:};R;e;j;v;y=p=}>O>Z>[Q/z*eU4k/z4m7xQ4m/|R7x4lS*o$|*ZR0Y*ox*S$v)e*t*u+V/v0d0e4R4g5R5S5W7p8U:R:x=p=}>O!d.j(u)c*[*e.l.m.q/_/k/|0v1e3h4[4h4l5r7]7`7w7z8X8Z9t9|:S:};R;e;j;v>Z>[U/h*S.j7ca7c3}7e7f7j9h:t:w;yQ0a*tQ3i.lU4}0a3i9kR9k7e|*U$v)e*t*u+V/g/v0d0e4R4g4|5R5S5W7p8U:R:x=p=}>O!h.k(u)c*[*e.l.m.q/_/k/|0v1e3f3h4[4h4l5r7]7^7`7w7z8X8Z9t9|:S:};R;e;j;v>Z>[U/j*U.k7de7d3}7e7f7j9h9i:t:u:w;yQ0c*uQ3j.mU5P0c3j9lR9l7fQ*z%UR0g*zQ5]0vR8Y5]Q+_%kR0u+_Q5v1jS8j5v:[R:[8kQ,[&_R1m,[Q5{1oR8m5{Q1{,fS6]1{8zR8z6_Q1U+rW5h1U5j8a:VQ5j1XQ8a5iR:V8bQ+w&QR1[+wQ2_,xR6m2_YrOXst#dQ&v!ZQ+a%mQ,r&rQ,t&tQ,u&uQ,w&wQ2Y,sS2],x2_R6l2[Q%opQ&z!_Q&}!aQ'P!bQ'R!cQ'q!uQ+`%lQ+l%zQ,Q&XQ,h&mQ-P&|W-p'k's't'wQ-w'oQ0X*nQ1P+mQ1c,PS2O,i,lQ2g-OQ2h-RQ2i-SQ2}-oW3P-r-s-v-xQ5a1QQ5m1_Q5q1eQ6V1uQ6a2QQ6k2ZU6z3O3R3UQ6}3SQ8]5bQ8e5oQ8g5rQ8l5zQ8u6WQ8{6`S9[6{7PQ9^7OQ:W8cQ:b8vQ:g8|Q:n9]Q;U:XQ;]:cQ;a:oQ;l;VR;o;^Q%zyQ'd!iQ'o!uU+m%{%|%}Q-W'VU-k'e'f'gS-o'k'uQ0Q*jS1Q+n+oQ2o-YS2{-l-mQ3S-tS4p0R0UQ5b1RQ6v2uQ6y2|Q7O3TU7{4r4s4vQ9z7}R;O9{S$wi>PR*{%VU%Ui%V>PR0f*yQ$viS(u#v+iS)c$b$cQ)e$dQ*[$xS*e${*YQ*t%OQ*u%QQ+Q%^Q+R%_Q+V%cQ.l<oQ.m<qQ.o<uQ.p<wQ.q<yQ/_)yQ/g*RQ/i*TQ/k*VQ/v*aS/|*g/mQ0d*wQ0e*xl0v+f,V.f1i1q3c6S7W8q9b:`:r;[;dQ1e,SQ3f=SQ3g=UQ3h=XS3}<l<mQ4R/PS4[/d4^Q4g/xQ4h/yQ4l/{Q4|0`Q5O0bQ5R0iQ5S0jQ5W0oQ5r1fQ7]=]Q7^=_Q7_=aQ7`=cQ7e<pQ7f<rQ7h<vQ7i<xQ7j<zQ7p4_Q7w4jQ7z4oQ8U5QQ8X5[Q8Z5_Q9h=YQ9i=TQ9j=VQ9t7vQ9|8QQ:R8VQ:S8[Q:t=^Q:u=`Q:v=bQ:w=dQ:x9pQ:}9yQ;R:PQ;e=gQ;j;QQ;v;kQ;y=hQ=p>PQ=}>XQ>O>YQ>Z>]R>[>^Q+O%]Q.n<sR7g<tnpOXst!Z#d%m&r&t&u&w,s,x2[2_Q!fPS#fZ#oQ&|!`W'h!o*i0]4zQ(P#SQ)Q#{Q)r$nS,l&k&nQ,q&oQ-O&{S-T'T/nQ-g'bQ.x)OQ/[)sQ0s+]Q0y+gQ2W,pQ2y-iQ3a.gQ4W/VQ5U0lQ6Q1rQ6c2SQ6d2TQ6h2VQ6j2XQ6o2aQ7Z3dQ7m4TQ8s6TQ9P6eQ9Q6fQ9S6iQ9f7[Q:a8tR:k9T#[cOPXZst!Z!`!o#d#o#{%m&k&n&o&r&t&u&w&{'T'b)O*i+]+g,p,s,x-i.g/n0]0l1r2S2T2V2X2[2_2a3d4z6T6e6f6i7[8t9TQ#YWQ#eYQ%quQ%svS%uw!gS(S#W(VQ(Y#ZQ(t#uQ(y#xQ)R$OQ)S$PQ)T$QQ)U$RQ)V$SQ)W$TQ)X$UQ)Y$VQ)Z$WQ)[$XQ)^$ZQ)`$_Q)b$aQ)g$eW)q$n)s/V4TQ+d%tQ+x&RS-Z'X2pQ-x'rS-}(T.PQ.S(]Q.U(dQ.s(xQ.v(zQ.z<UQ.|<XQ.}<YQ/O<]Q/b)}Q0p+XQ2k-UQ2n-XQ3O-qQ3V.VQ3k.tQ3p<^Q3q<_Q3r<`Q3s<aQ3t<bQ3u<cQ3v<dQ3w<eQ3x<fQ3y<gQ3z<hQ3{.{Q3|<kQ4P<nQ4Q<{Q4X<iQ5X0rQ5c1SQ6u=OQ6{3QQ7Q3WQ7a3lQ7b=PQ7k=RQ7l=ZQ8k5wQ9X6sQ9]6|Q9g=[Q9m=eQ9n=fQ:o9_Q;W:ZQ;`:mQ<W#SR=v>SR#[WR'Z!el!tQ!r!v!y!z'`'l'm'n-e-u1o5{5}S'V!e-]U*j$|*Z*oS-Y'W'_S0U*k*qQ0^*rQ2u-cQ4v0[R4{0_R({#xQ!fQT-d'`-e]!qQ!r'`-e1o5{Q#p]R'i<VR)f$dY!uQ'`-e1o5{Q'k!rS'u!v!yS'w!z5}S-t'l'mQ-v'nR3T-uT#kZ%eS#jZ%eS%km,oU(g#h#i#lS.Y(h(iQ.^(jQ0t+^Q3Y.ZU3Z.[.]._S7S3[3]R9`7Td#^W#W#Z%h(T(^*Y+Z.T/mr#gZm#h#i#l%e(h(i(j+^.Z.[.]._3[3]7TS*]$x*bQ/t*^Q2U,oQ2l-VQ4`/pQ6q2dQ7s4aQ9W6rT=m'X+[V#aW%h*YU#`W%h*YS(U#W(^U(Z#Z+Z/mS-['X+[T.O(T.TV'^!e%i*ZQ$lfR)x$qT)m$l)nR4V/UT*_$x*bT*h${*YQ0w+fQ1g,VQ3_.fQ5t1iQ6P1qQ7X3cQ8r6SQ9c7WQ:^8qQ:p9bQ;Z:`Q;c:rQ;n;[R;q;dnqOXst!Z#d%m&r&t&u&w,s,x2[2_Q&l!VR,h&itmOXst!U!V!Z#d%m&i&r&t&u&w,s,x2[2_R,o&oT%lm,oR1k,XR,g&gQ&U|S+}&V&WR1^,OR+s&PT&p!W&sT&q!W&sT2^,x2_",
  nodeNames: "\u26A0 ArithOp ArithOp ?. JSXStartTag LineComment BlockComment Script Hashbang ExportDeclaration export Star as VariableName String Escape from ; default FunctionDeclaration async function VariableDefinition > < TypeParamList in out const TypeDefinition extends ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation InterpolationStart NullType null VoidType void TypeofType typeof MemberExpression . PropertyName [ TemplateString Escape Interpolation super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewTarget new NewExpression ) ( ArgList UnaryExpression delete LogicOp BitOp YieldExpression yield AwaitExpression await ParenthesizedExpression ClassExpression class ClassBody MethodDeclaration Decorator @ MemberExpression PrivatePropertyName CallExpression TypeArgList CompareOp < declare Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly accessor Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof satisfies CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression InstantiationExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXSelfClosingTag JSXIdentifier JSXBuiltin JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast < ArrowFunction TypeParamList SequenceExpression InstantiationExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature PropertyDefinition CallSignature TypePredicate asserts is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var using TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration defer ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement SingleExpression SingleClassItem",
  maxTerm: 380,
  context: trackNewline,
  nodeProps: [
    ["isolate", -8, 5, 6, 14, 37, 39, 51, 53, 55, ""],
    ["group", -26, 9, 17, 19, 68, 207, 211, 215, 216, 218, 221, 224, 234, 237, 243, 245, 247, 249, 252, 258, 264, 266, 268, 270, 272, 274, 275, "Statement", -34, 13, 14, 32, 35, 36, 42, 51, 54, 55, 57, 62, 70, 72, 76, 80, 82, 84, 85, 110, 111, 120, 121, 136, 139, 141, 142, 143, 144, 145, 147, 148, 167, 169, 171, "Expression", -23, 31, 33, 37, 41, 43, 45, 173, 175, 177, 178, 180, 181, 182, 184, 185, 186, 188, 189, 190, 201, 203, 205, 206, "Type", -3, 88, 103, 109, "ClassItem"],
    ["openedBy", 23, "<", 38, "InterpolationStart", 56, "[", 60, "{", 73, "(", 160, "JSXStartCloseTag"],
    ["closedBy", -2, 24, 168, ">", 40, "InterpolationEnd", 50, "]", 61, "}", 74, ")", 165, "JSXEndTag"]
  ],
  propSources: [jsHighlight],
  skippedNodes: [0, 5, 6, 278],
  repeatNodeCount: 37,
  tokenData: "$Fq07[R!bOX%ZXY+gYZ-yZ[+g[]%Z]^.c^p%Zpq+gqr/mrs3cst:_tuEruvJSvwLkwx! Yxy!'iyz!(sz{!)}{|!,q|}!.O}!O!,q!O!P!/Y!P!Q!9j!Q!R#:O!R![#<_![!]#I_!]!^#Jk!^!_#Ku!_!`$![!`!a$$v!a!b$*T!b!c$,r!c!}Er!}#O$-|#O#P$/W#P#Q$4o#Q#R$5y#R#SEr#S#T$7W#T#o$8b#o#p$<r#p#q$=h#q#r$>x#r#s$@U#s$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$I|Er$I|$I}$Dk$I}$JO$Dk$JO$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr(n%d_$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&j&hT$i&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c&j&zP;=`<%l&c'|'U]$i&j(Z!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!b(SU(Z!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!b(iP;=`<%l'}'|(oP;=`<%l&}'[(y]$i&j(WpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rp)wU(WpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)rp*^P;=`<%l)r'[*dP;=`<%l(r#S*nX(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g#S+^P;=`<%l*g(n+dP;=`<%l%Z07[+rq$i&j(Wp(Z!b'|0/lOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p$f%Z$f$g+g$g#BY%Z#BY#BZ+g#BZ$IS%Z$IS$I_+g$I_$JT%Z$JT$JU+g$JU$KV%Z$KV$KW+g$KW&FU%Z&FU&FV+g&FV;'S%Z;'S;=`+a<%l?HT%Z?HT?HU+g?HUO%Z07[.ST(X#S$i&j'}0/lO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c07[.n_$i&j(Wp(Z!b'}0/lOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)3p/x`$i&j!p),Q(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW1V`#v(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`2X!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW2d_#v(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At3l_(V':f$i&j(Z!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k(^4r_$i&j(Z!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k&z5vX$i&jOr5qrs6cs!^5q!^!_6y!_#o5q#o#p6y#p;'S5q;'S;=`7h<%lO5q&z6jT$d`$i&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c`6|TOr6yrs7]s;'S6y;'S;=`7b<%lO6y`7bO$d``7eP;=`<%l6y&z7kP;=`<%l5q(^7w]$d`$i&j(Z!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!r8uZ(Z!bOY8pYZ6yZr8prs9hsw8pwx6yx#O8p#O#P6y#P;'S8p;'S;=`:R<%lO8p!r9oU$d`(Z!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!r:UP;=`<%l8p(^:[P;=`<%l4k%9[:hh$i&j(Wp(Z!bOY%ZYZ&cZq%Zqr<Srs&}st%ZtuCruw%Zwx(rx!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr(r<__WS$i&j(Wp(Z!bOY<SYZ&cZr<Srs=^sw<Swx@nx!^<S!^!_Bm!_#O<S#O#P>`#P#o<S#o#pBm#p;'S<S;'S;=`Cl<%lO<S(Q=g]WS$i&j(Z!bOY=^YZ&cZw=^wx>`x!^=^!^!_?q!_#O=^#O#P>`#P#o=^#o#p?q#p;'S=^;'S;=`@h<%lO=^&n>gXWS$i&jOY>`YZ&cZ!^>`!^!_?S!_#o>`#o#p?S#p;'S>`;'S;=`?k<%lO>`S?XSWSOY?SZ;'S?S;'S;=`?e<%lO?SS?hP;=`<%l?S&n?nP;=`<%l>`!f?xWWS(Z!bOY?qZw?qwx?Sx#O?q#O#P?S#P;'S?q;'S;=`@b<%lO?q!f@eP;=`<%l?q(Q@kP;=`<%l=^'`@w]WS$i&j(WpOY@nYZ&cZr@nrs>`s!^@n!^!_Ap!_#O@n#O#P>`#P#o@n#o#pAp#p;'S@n;'S;=`Bg<%lO@ntAwWWS(WpOYApZrAprs?Ss#OAp#O#P?S#P;'SAp;'S;=`Ba<%lOAptBdP;=`<%lAp'`BjP;=`<%l@n#WBvYWS(Wp(Z!bOYBmZrBmrs?qswBmwxApx#OBm#O#P?S#P;'SBm;'S;=`Cf<%lOBm#WCiP;=`<%lBm(rCoP;=`<%l<S%9[C}i$i&j(o%1l(Wp(Z!bOY%ZYZ&cZr%Zrs&}st%ZtuCruw%Zwx(rx!Q%Z!Q![Cr![!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr%9[EoP;=`<%lCr07[FRk$i&j(Wp(Z!b$]#t(T,2j(e$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr+dHRk$i&j(Wp(Z!b$]#tOY%ZYZ&cZr%Zrs&}st%ZtuGvuw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Gv![!^%Z!^!_*g!_!c%Z!c!}Gv!}#O%Z#O#P&c#P#R%Z#R#SGv#S#T%Z#T#oGv#o#p*g#p$g%Z$g;'SGv;'S;=`Iv<%lOGv+dIyP;=`<%lGv07[JPP;=`<%lEr(KWJ_`$i&j(Wp(Z!b#p(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWKl_$i&j$Q(Ch(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,#xLva(z+JY$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sv%ZvwM{wx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWNW`$i&j#z(Ch(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At! c_(Y';W$i&j(WpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b'l!!i_$i&j(WpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b&z!#mX$i&jOw!#hwx6cx!^!#h!^!_!$Y!_#o!#h#o#p!$Y#p;'S!#h;'S;=`!$r<%lO!#h`!$]TOw!$Ywx7]x;'S!$Y;'S;=`!$l<%lO!$Y`!$oP;=`<%l!$Y&z!$uP;=`<%l!#h'l!%R]$d`$i&j(WpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r!Q!&PZ(WpOY!%zYZ!$YZr!%zrs!$Ysw!%zwx!&rx#O!%z#O#P!$Y#P;'S!%z;'S;=`!']<%lO!%z!Q!&yU$d`(WpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)r!Q!'`P;=`<%l!%z'l!'fP;=`<%l!!b/5|!'t_!l/.^$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#&U!)O_!k!Lf$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z-!n!*[b$i&j(Wp(Z!b(U%&f#q(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rxz%Zz{!+d{!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW!+o`$i&j(Wp(Z!b#n(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;x!,|`$i&j(Wp(Z!br+4YOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,$U!.Z_!]+Jf$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!/ec$i&j(Wp(Z!b!Q.2^OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!0p!P!Q%Z!Q![!3Y![!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!0ya$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!2O!P!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!2Z_![!L^$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!3eg$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!3Y![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S!3Y#S#X%Z#X#Y!4|#Y#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!5Vg$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx{%Z{|!6n|}%Z}!O!6n!O!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!6wc$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!8_c$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!9uf$i&j(Wp(Z!b#o(ChOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcxz!;Zz{#-}{!P!;Z!P!Q#/d!Q!^!;Z!^!_#(i!_!`#7S!`!a#8i!a!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z?O!;fb$i&j(Wp(Z!b!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z>^!<w`$i&j(Z!b!X7`OY!<nYZ&cZw!<nwx!=yx!P!<n!P!Q!Eq!Q!^!<n!^!_!Gr!_!}!<n!}#O!KS#O#P!Dy#P#o!<n#o#p!Gr#p;'S!<n;'S;=`!L]<%lO!<n<z!>Q^$i&j!X7`OY!=yYZ&cZ!P!=y!P!Q!>|!Q!^!=y!^!_!@c!_!}!=y!}#O!CW#O#P!Dy#P#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!?Td$i&j!X7`O!^&c!_#W&c#W#X!>|#X#Z&c#Z#[!>|#[#]&c#]#^!>|#^#a&c#a#b!>|#b#g&c#g#h!>|#h#i&c#i#j!>|#j#k!>|#k#m&c#m#n!>|#n#o&c#p;'S&c;'S;=`&w<%lO&c7`!@hX!X7`OY!@cZ!P!@c!P!Q!AT!Q!}!@c!}#O!Ar#O#P!Bq#P;'S!@c;'S;=`!CQ<%lO!@c7`!AYW!X7`#W#X!AT#Z#[!AT#]#^!AT#a#b!AT#g#h!AT#i#j!AT#j#k!AT#m#n!AT7`!AuVOY!ArZ#O!Ar#O#P!B[#P#Q!@c#Q;'S!Ar;'S;=`!Bk<%lO!Ar7`!B_SOY!ArZ;'S!Ar;'S;=`!Bk<%lO!Ar7`!BnP;=`<%l!Ar7`!BtSOY!@cZ;'S!@c;'S;=`!CQ<%lO!@c7`!CTP;=`<%l!@c<z!C][$i&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#O!CW#O#P!DR#P#Q!=y#Q#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DWX$i&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DvP;=`<%l!CW<z!EOX$i&jOY!=yYZ&cZ!^!=y!^!_!@c!_#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!EnP;=`<%l!=y>^!Ezl$i&j(Z!b!X7`OY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#W&}#W#X!Eq#X#Z&}#Z#[!Eq#[#]&}#]#^!Eq#^#a&}#a#b!Eq#b#g&}#g#h!Eq#h#i&}#i#j!Eq#j#k!Eq#k#m&}#m#n!Eq#n#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}8r!GyZ(Z!b!X7`OY!GrZw!Grwx!@cx!P!Gr!P!Q!Hl!Q!}!Gr!}#O!JU#O#P!Bq#P;'S!Gr;'S;=`!J|<%lO!Gr8r!Hse(Z!b!X7`OY'}Zw'}x#O'}#P#W'}#W#X!Hl#X#Z'}#Z#[!Hl#[#]'}#]#^!Hl#^#a'}#a#b!Hl#b#g'}#g#h!Hl#h#i'}#i#j!Hl#j#k!Hl#k#m'}#m#n!Hl#n;'S'};'S;=`(f<%lO'}8r!JZX(Z!bOY!JUZw!JUwx!Arx#O!JU#O#P!B[#P#Q!Gr#Q;'S!JU;'S;=`!Jv<%lO!JU8r!JyP;=`<%l!JU8r!KPP;=`<%l!Gr>^!KZ^$i&j(Z!bOY!KSYZ&cZw!KSwx!CWx!^!KS!^!_!JU!_#O!KS#O#P!DR#P#Q!<n#Q#o!KS#o#p!JU#p;'S!KS;'S;=`!LV<%lO!KS>^!LYP;=`<%l!KS>^!L`P;=`<%l!<n=l!Ll`$i&j(Wp!X7`OY!LcYZ&cZr!Lcrs!=ys!P!Lc!P!Q!Mn!Q!^!Lc!^!_# o!_!}!Lc!}#O#%P#O#P!Dy#P#o!Lc#o#p# o#p;'S!Lc;'S;=`#&Y<%lO!Lc=l!Mwl$i&j(Wp!X7`OY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#W(r#W#X!Mn#X#Z(r#Z#[!Mn#[#](r#]#^!Mn#^#a(r#a#b!Mn#b#g(r#g#h!Mn#h#i(r#i#j!Mn#j#k!Mn#k#m(r#m#n!Mn#n#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r8Q# vZ(Wp!X7`OY# oZr# ors!@cs!P# o!P!Q#!i!Q!}# o!}#O#$R#O#P!Bq#P;'S# o;'S;=`#$y<%lO# o8Q#!pe(Wp!X7`OY)rZr)rs#O)r#P#W)r#W#X#!i#X#Z)r#Z#[#!i#[#])r#]#^#!i#^#a)r#a#b#!i#b#g)r#g#h#!i#h#i)r#i#j#!i#j#k#!i#k#m)r#m#n#!i#n;'S)r;'S;=`*Z<%lO)r8Q#$WX(WpOY#$RZr#$Rrs!Ars#O#$R#O#P!B[#P#Q# o#Q;'S#$R;'S;=`#$s<%lO#$R8Q#$vP;=`<%l#$R8Q#$|P;=`<%l# o=l#%W^$i&j(WpOY#%PYZ&cZr#%Prs!CWs!^#%P!^!_#$R!_#O#%P#O#P!DR#P#Q!Lc#Q#o#%P#o#p#$R#p;'S#%P;'S;=`#&S<%lO#%P=l#&VP;=`<%l#%P=l#&]P;=`<%l!Lc?O#&kn$i&j(Wp(Z!b!X7`OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#W%Z#W#X#&`#X#Z%Z#Z#[#&`#[#]%Z#]#^#&`#^#a%Z#a#b#&`#b#g%Z#g#h#&`#h#i%Z#i#j#&`#j#k#&`#k#m%Z#m#n#&`#n#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z9d#(r](Wp(Z!b!X7`OY#(iZr#(irs!Grsw#(iwx# ox!P#(i!P!Q#)k!Q!}#(i!}#O#+`#O#P!Bq#P;'S#(i;'S;=`#,`<%lO#(i9d#)th(Wp(Z!b!X7`OY*gZr*grs'}sw*gwx)rx#O*g#P#W*g#W#X#)k#X#Z*g#Z#[#)k#[#]*g#]#^#)k#^#a*g#a#b#)k#b#g*g#g#h#)k#h#i*g#i#j#)k#j#k#)k#k#m*g#m#n#)k#n;'S*g;'S;=`+Z<%lO*g9d#+gZ(Wp(Z!bOY#+`Zr#+`rs!JUsw#+`wx#$Rx#O#+`#O#P!B[#P#Q#(i#Q;'S#+`;'S;=`#,Y<%lO#+`9d#,]P;=`<%l#+`9d#,cP;=`<%l#(i?O#,o`$i&j(Wp(Z!bOY#,fYZ&cZr#,frs!KSsw#,fwx#%Px!^#,f!^!_#+`!_#O#,f#O#P!DR#P#Q!;Z#Q#o#,f#o#p#+`#p;'S#,f;'S;=`#-q<%lO#,f?O#-tP;=`<%l#,f?O#-zP;=`<%l!;Z07[#.[b$i&j(Wp(Z!b(O0/l!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z07[#/o_$i&j(Wp(Z!bT0/lOY#/dYZ&cZr#/drs#0nsw#/dwx#4Ox!^#/d!^!_#5}!_#O#/d#O#P#1p#P#o#/d#o#p#5}#p;'S#/d;'S;=`#6|<%lO#/d06j#0w]$i&j(Z!bT0/lOY#0nYZ&cZw#0nwx#1px!^#0n!^!_#3R!_#O#0n#O#P#1p#P#o#0n#o#p#3R#p;'S#0n;'S;=`#3x<%lO#0n05W#1wX$i&jT0/lOY#1pYZ&cZ!^#1p!^!_#2d!_#o#1p#o#p#2d#p;'S#1p;'S;=`#2{<%lO#1p0/l#2iST0/lOY#2dZ;'S#2d;'S;=`#2u<%lO#2d0/l#2xP;=`<%l#2d05W#3OP;=`<%l#1p01O#3YW(Z!bT0/lOY#3RZw#3Rwx#2dx#O#3R#O#P#2d#P;'S#3R;'S;=`#3r<%lO#3R01O#3uP;=`<%l#3R06j#3{P;=`<%l#0n05x#4X]$i&j(WpT0/lOY#4OYZ&cZr#4Ors#1ps!^#4O!^!_#5Q!_#O#4O#O#P#1p#P#o#4O#o#p#5Q#p;'S#4O;'S;=`#5w<%lO#4O00^#5XW(WpT0/lOY#5QZr#5Qrs#2ds#O#5Q#O#P#2d#P;'S#5Q;'S;=`#5q<%lO#5Q00^#5tP;=`<%l#5Q05x#5zP;=`<%l#4O01p#6WY(Wp(Z!bT0/lOY#5}Zr#5}rs#3Rsw#5}wx#5Qx#O#5}#O#P#2d#P;'S#5};'S;=`#6v<%lO#5}01p#6yP;=`<%l#5}07[#7PP;=`<%l#/d)3h#7ab$i&j$Q(Ch(Wp(Z!b!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;ZAt#8vb$Z#t$i&j(Wp(Z!b!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z'Ad#:Zp$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#U%Z#U#V#?i#V#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#d#Bq#d#l%Z#l#m#Es#m#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#<jk$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#>j_$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#?rd$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#A]f$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Bzc$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Dbe$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#E|g$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Gpi$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x#Il_!g$b$i&j$O)Lv(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)[#Jv_al$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f#LS^h#)`#R-<U(Wp(Z!b$n7`OY*gZr*grs'}sw*gwx)rx!P*g!P!Q#MO!Q!^*g!^!_#Mt!_!`$ f!`#O*g#P;'S*g;'S;=`+Z<%lO*g(n#MXX$k&j(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El#M}Z#r(Ch(Wp(Z!bOY*gZr*grs'}sw*gwx)rx!_*g!_!`#Np!`#O*g#P;'S*g;'S;=`+Z<%lO*g(El#NyX$Q(Ch(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El$ oX#s(Ch(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g*)x$!ga#`*!Y$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`!a$#l!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(K[$#w_#k(Cl$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x$%Vag!*r#s(Ch$f#|$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`$&[!`!a$'f!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$&g_#s(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$'qa#r(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`!a$(v!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$)R`#r(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(Kd$*`a(r(Ct$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!a%Z!a!b$+e!b#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$+p`$i&j#{(Ch(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#`$,}_!|$Ip$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f$.X_!S0,v$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(n$/]Z$i&jO!^$0O!^!_$0f!_#i$0O#i#j$0k#j#l$0O#l#m$2^#m#o$0O#o#p$0f#p;'S$0O;'S;=`$4i<%lO$0O(n$0VT_#S$i&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#S$0kO_#S(n$0p[$i&jO!Q&c!Q![$1f![!^&c!_!c&c!c!i$1f!i#T&c#T#Z$1f#Z#o&c#o#p$3|#p;'S&c;'S;=`&w<%lO&c(n$1kZ$i&jO!Q&c!Q![$2^![!^&c!_!c&c!c!i$2^!i#T&c#T#Z$2^#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$2cZ$i&jO!Q&c!Q![$3U![!^&c!_!c&c!c!i$3U!i#T&c#T#Z$3U#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$3ZZ$i&jO!Q&c!Q![$0O![!^&c!_!c&c!c!i$0O!i#T&c#T#Z$0O#Z#o&c#p;'S&c;'S;=`&w<%lO&c#S$4PR!Q![$4Y!c!i$4Y#T#Z$4Y#S$4]S!Q![$4Y!c!i$4Y#T#Z$4Y#q#r$0f(n$4lP;=`<%l$0O#1[$4z_!Y#)l$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$6U`#x(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;p$7c_$i&j(Wp(Z!b(a+4QOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$8qk$i&j(Wp(Z!b(T,2j$_#t(e$I[OY%ZYZ&cZr%Zrs&}st%Ztu$8buw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$8b![!^%Z!^!_*g!_!c%Z!c!}$8b!}#O%Z#O#P&c#P#R%Z#R#S$8b#S#T%Z#T#o$8b#o#p*g#p$g%Z$g;'S$8b;'S;=`$<l<%lO$8b+d$:qk$i&j(Wp(Z!b$_#tOY%ZYZ&cZr%Zrs&}st%Ztu$:fuw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$:f![!^%Z!^!_*g!_!c%Z!c!}$:f!}#O%Z#O#P&c#P#R%Z#R#S$:f#S#T%Z#T#o$:f#o#p*g#p$g%Z$g;'S$:f;'S;=`$<f<%lO$:f+d$<iP;=`<%l$:f07[$<oP;=`<%l$8b#Jf$<{X!_#Hb(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g,#x$=sa(y+JY$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p#q$+e#q;'S%Z;'S;=`+a<%lO%Z)>v$?V_!^(CdvBr$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z?O$@a_!q7`$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$Aq|$i&j(Wp(Z!b'|0/l$]#t(T,2j(e$I[OX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr07[$D|k$i&j(Wp(Z!b'}0/l$]#t(T,2j(e$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr",
  tokenizers: [noSemicolon, noSemicolonType, operatorToken, jsx, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, insertSemicolon, new import_lr3.LocalTokenGroup("$S~RRtu[#O#Pg#S#T#|~_P#o#pb~gOx~~jVO#i!P#i#j!U#j#l!P#l#m!q#m;'S!P;'S;=`#v<%lO!P~!UO!U~~!XS!Q![!e!c!i!e#T#Z!e#o#p#Z~!hR!Q![!q!c!i!q#T#Z!q~!tR!Q![!}!c!i!}#T#Z!}~#QR!Q![!P!c!i!P#T#Z!P~#^R!Q![#g!c!i#g#T#Z#g~#jS!Q![#g!c!i#g#T#Z#g#q#r!P~#yP;=`<%l!P~$RO(c~~", 141, 340), new import_lr3.LocalTokenGroup("j~RQYZXz{^~^O(Q~~aP!P!Qd~iO(R~~", 25, 323)],
  topRules: { "Script": [0, 7], "SingleExpression": [1, 276], "SingleClassItem": [2, 277] },
  dialects: { jsx: 0, ts: 15175 },
  dynamicPrecedences: { "80": 1, "82": 1, "94": 1, "169": 1, "199": 1 },
  specialized: [{ term: 327, get: (value) => spec_identifier2[value] || -1 }, { term: 343, get: (value) => spec_word[value] || -1 }, { term: 95, get: (value) => spec_LessThan[value] || -1 }],
  tokenPrec: 15201
});

// node_modules/@codemirror/lang-javascript/dist/index.js
var import_language2 = require("@codemirror/language");
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");
var import_autocomplete = require("@codemirror/autocomplete");
var import_common4 = require("@lezer/common");
var snippets = [
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("do {\n	${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("while (${}) {\n	${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("try {\n	${}\n} catch (${error}) {\n	${}\n}", {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("if (${}) {\n	${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("if (${}) {\n	${}\n} else {\n	${}\n}", {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("class ${name} {\n	constructor(${params}) {\n		${}\n	}\n}", {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
];
var typescriptSnippets = /* @__PURE__ */ snippets.concat([
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("interface ${name} {\n	${}\n}", {
    label: "interface",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("type ${name} = ${type}", {
    label: "type",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ (0, import_autocomplete.snippetCompletion)("enum ${name} {\n	${}\n}", {
    label: "enum",
    detail: "definition",
    type: "keyword"
  })
]);
var cache = /* @__PURE__ */ new import_common4.NodeWeakMap();
var ScopeNodes = /* @__PURE__ */ new Set([
  "Script",
  "Block",
  "FunctionExpression",
  "FunctionDeclaration",
  "ArrowFunction",
  "MethodDeclaration",
  "ForStatement"
]);
function defID(type) {
  return (node, def) => {
    let id = node.node.getChild("VariableDefinition");
    if (id)
      def(id, type);
    return true;
  };
}
var functionContext = ["FunctionDeclaration"];
var gatherCompletions = {
  FunctionDeclaration: /* @__PURE__ */ defID("function"),
  ClassDeclaration: /* @__PURE__ */ defID("class"),
  ClassExpression: () => true,
  EnumDeclaration: /* @__PURE__ */ defID("constant"),
  TypeAliasDeclaration: /* @__PURE__ */ defID("type"),
  NamespaceDeclaration: /* @__PURE__ */ defID("namespace"),
  VariableDefinition(node, def) {
    if (!node.matchContext(functionContext))
      def(node, "variable");
  },
  TypeDefinition(node, def) {
    def(node, "type");
  },
  __proto__: null
};
function getScope(doc, node) {
  let cached = cache.get(node);
  if (cached)
    return cached;
  let completions = [], top = true;
  function def(node2, type) {
    let name = doc.sliceString(node2.from, node2.to);
    completions.push({ label: name, type });
  }
  node.cursor(import_common4.IterMode.IncludeAnonymous).iterate((node2) => {
    if (top) {
      top = false;
    } else if (node2.name) {
      let gather = gatherCompletions[node2.name];
      if (gather && gather(node2, def) || ScopeNodes.has(node2.name))
        return false;
    } else if (node2.to - node2.from > 8192) {
      for (let c of getScope(doc, node2.node))
        completions.push(c);
      return false;
    }
  });
  cache.set(node, completions);
  return completions;
}
var Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;
var dontComplete = [
  "TemplateString",
  "String",
  "RegExp",
  "LineComment",
  "BlockComment",
  "VariableDefinition",
  "TypeDefinition",
  "Label",
  "PropertyDefinition",
  "PropertyName",
  "PrivatePropertyDefinition",
  "PrivatePropertyName",
  "JSXText",
  "JSXAttributeValue",
  "JSXOpenTag",
  "JSXCloseTag",
  "JSXSelfClosingTag",
  ".",
  "?."
];
function localCompletionSource(context) {
  let inner = (0, import_language2.syntaxTree)(context.state).resolveInner(context.pos, -1);
  if (dontComplete.indexOf(inner.name) > -1)
    return null;
  let isWord = inner.name == "VariableName" || inner.to - inner.from < 20 && Identifier.test(context.state.sliceDoc(inner.from, inner.to));
  if (!isWord && !context.explicit)
    return null;
  let options = [];
  for (let pos = inner; pos; pos = pos.parent) {
    if (ScopeNodes.has(pos.name))
      options = options.concat(getScope(context.state.doc, pos));
  }
  return {
    options,
    from: isWord ? inner.from : context.pos,
    validFor: Identifier
  };
}
var javascriptLanguage = /* @__PURE__ */ import_language2.LRLanguage.define({
  name: "javascript",
  parser: /* @__PURE__ */ parser4.configure({
    props: [
      /* @__PURE__ */ import_language2.indentNodeProp.add({
        IfStatement: /* @__PURE__ */ (0, import_language2.continuedIndent)({ except: /^\s*({|else\b)/ }),
        TryStatement: /* @__PURE__ */ (0, import_language2.continuedIndent)({ except: /^\s*({|catch\b|finally\b)/ }),
        LabeledStatement: import_language2.flatIndent,
        SwitchBody: (context) => {
          let after = context.textAfter, closed = /^\s*\}/.test(after), isCase = /^\s*(case|default)\b/.test(after);
          return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit;
        },
        Block: /* @__PURE__ */ (0, import_language2.delimitedIndent)({ closing: "}" }),
        ArrowFunction: (cx) => cx.baseIndent + cx.unit,
        "TemplateString BlockComment": () => null,
        "Statement Property": /* @__PURE__ */ (0, import_language2.continuedIndent)({ except: /^\s*{/ }),
        JSXElement(context) {
          let closed = /^\s*<\//.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        JSXEscape(context) {
          let closed = /\s*\}/.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        "JSXOpenTag JSXSelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit;
        }
      }),
      /* @__PURE__ */ import_language2.foldNodeProp.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression ObjectType": import_language2.foldInside,
        BlockComment(tree) {
          return { from: tree.from + 2, to: tree.to - 2 };
        },
        JSXElement(tree) {
          let open = tree.firstChild;
          if (!open || open.name == "JSXSelfClosingTag")
            return null;
          let close = tree.lastChild;
          return { from: open.to, to: close.type.isError ? tree.to : close.from };
        },
        "JSXSelfClosingTag JSXOpenTag"(tree) {
          var _a;
          let name = (_a = tree.firstChild) === null || _a === void 0 ? void 0 : _a.nextSibling, close = tree.lastChild;
          if (!name || name.type.isError)
            return null;
          return { from: name.to, to: close.type.isError ? tree.to : close.from };
        }
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
});
var jsxSublanguage = {
  test: (node) => /^JSX/.test(node.name),
  facet: /* @__PURE__ */ (0, import_language2.defineLanguageFacet)({ commentTokens: { block: { open: "{/*", close: "*/}" } } })
};
var typescriptLanguage = /* @__PURE__ */ javascriptLanguage.configure({ dialect: "ts" }, "typescript");
var jsxLanguage = /* @__PURE__ */ javascriptLanguage.configure({
  dialect: "jsx",
  props: [/* @__PURE__ */ import_language2.sublanguageProp.add((n) => n.isTop ? [jsxSublanguage] : void 0)]
});
var tsxLanguage = /* @__PURE__ */ javascriptLanguage.configure({
  dialect: "jsx ts",
  props: [/* @__PURE__ */ import_language2.sublanguageProp.add((n) => n.isTop ? [jsxSublanguage] : void 0)]
}, "typescript");
var kwCompletion = (name) => ({ label: name, type: "keyword" });
var keywords = /* @__PURE__ */ "break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map(kwCompletion);
var typescriptKeywords = /* @__PURE__ */ keywords.concat(/* @__PURE__ */ ["declare", "implements", "private", "protected", "public"].map(kwCompletion));
function javascript(config = {}) {
  let lang = config.jsx ? config.typescript ? tsxLanguage : jsxLanguage : config.typescript ? typescriptLanguage : javascriptLanguage;
  let completions = config.typescript ? typescriptSnippets.concat(typescriptKeywords) : snippets.concat(keywords);
  return new import_language2.LanguageSupport(lang, [
    javascriptLanguage.data.of({
      autocomplete: (0, import_autocomplete.ifNotIn)(dontComplete, (0, import_autocomplete.completeFromList)(completions))
    }),
    javascriptLanguage.data.of({
      autocomplete: localCompletionSource
    }),
    config.jsx ? autoCloseTags : []
  ]);
}
function findOpenTag(node) {
  for (; ; ) {
    if (node.name == "JSXOpenTag" || node.name == "JSXSelfClosingTag" || node.name == "JSXFragmentTag")
      return node;
    if (node.name == "JSXEscape" || !node.parent)
      return null;
    node = node.parent;
  }
}
function elementName(doc, tree, max = doc.length) {
  for (let ch = tree === null || tree === void 0 ? void 0 : tree.firstChild; ch; ch = ch.nextSibling) {
    if (ch.name == "JSXIdentifier" || ch.name == "JSXBuiltin" || ch.name == "JSXNamespacedName" || ch.name == "JSXMemberExpression")
      return doc.sliceString(ch.from, Math.min(ch.to, max));
  }
  return "";
}
var android = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent);
var autoCloseTags = /* @__PURE__ */ import_view.EditorView.inputHandler.of((view, from, to, text, defaultInsert) => {
  if ((android ? view.composing : view.compositionStarted) || view.state.readOnly || from != to || text != ">" && text != "/" || !javascriptLanguage.isActiveAt(view.state, from, -1))
    return false;
  let base = defaultInsert(), { state } = base;
  let closeTags = state.changeByRange((range) => {
    var _a;
    let { head } = range, around = (0, import_language2.syntaxTree)(state).resolveInner(head - 1, -1), name;
    if (around.name == "JSXStartTag")
      around = around.parent;
    if (state.doc.sliceString(head - 1, head) != text || around.name == "JSXAttributeValue" && around.to > head) ;
    else if (text == ">" && around.name == "JSXFragmentTag") {
      return { range, changes: { from: head, insert: `</>` } };
    } else if (text == "/" && around.name == "JSXStartCloseTag") {
      let empty = around.parent, base2 = empty.parent;
      if (base2 && empty.from == head - 2 && ((name = elementName(state.doc, base2.firstChild, head)) || ((_a = base2.firstChild) === null || _a === void 0 ? void 0 : _a.name) == "JSXFragmentTag")) {
        let insert = `${name}>`;
        return { range: import_state.EditorSelection.cursor(head + insert.length, -1), changes: { from: head, insert } };
      }
    } else if (text == ">") {
      let openTag = findOpenTag(around);
      if (openTag && openTag.name == "JSXOpenTag" && !/^\/?>|^<\//.test(state.doc.sliceString(head, head + 2)) && (name = elementName(state.doc, openTag, head)))
        return { range, changes: { from: head, insert: `</${name}>` } };
    }
    return { range };
  });
  if (closeTags.changes.empty)
    return false;
  view.dispatch([
    base,
    state.update(closeTags, { userEvent: "input.complete", scrollIntoView: true })
  ]);
  return true;
});

// node_modules/@codemirror/lang-html/dist/index.js
var import_view2 = require("@codemirror/view");
var import_state2 = require("@codemirror/state");
var import_language3 = require("@codemirror/language");
var Targets = ["_blank", "_self", "_top", "_parent"];
var Charsets = ["ascii", "utf-8", "utf-16", "latin1", "latin1"];
var Methods = ["get", "post", "put", "delete"];
var Encs = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"];
var Bool = ["true", "false"];
var S = {};
var Tags = {
  a: {
    attrs: {
      href: null,
      ping: null,
      type: null,
      media: null,
      target: Targets,
      hreflang: null
    }
  },
  abbr: S,
  address: S,
  area: {
    attrs: {
      alt: null,
      coords: null,
      href: null,
      target: null,
      ping: null,
      media: null,
      hreflang: null,
      type: null,
      shape: ["default", "rect", "circle", "poly"]
    }
  },
  article: S,
  aside: S,
  audio: {
    attrs: {
      src: null,
      mediagroup: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["none", "metadata", "auto"],
      autoplay: ["autoplay"],
      loop: ["loop"],
      controls: ["controls"]
    }
  },
  b: S,
  base: { attrs: { href: null, target: Targets } },
  bdi: S,
  bdo: S,
  blockquote: { attrs: { cite: null } },
  body: S,
  br: S,
  button: {
    attrs: {
      form: null,
      formaction: null,
      name: null,
      value: null,
      autofocus: ["autofocus"],
      disabled: ["autofocus"],
      formenctype: Encs,
      formmethod: Methods,
      formnovalidate: ["novalidate"],
      formtarget: Targets,
      type: ["submit", "reset", "button"]
    }
  },
  canvas: { attrs: { width: null, height: null } },
  caption: S,
  center: S,
  cite: S,
  code: S,
  col: { attrs: { span: null } },
  colgroup: { attrs: { span: null } },
  command: {
    attrs: {
      type: ["command", "checkbox", "radio"],
      label: null,
      icon: null,
      radiogroup: null,
      command: null,
      title: null,
      disabled: ["disabled"],
      checked: ["checked"]
    }
  },
  data: { attrs: { value: null } },
  datagrid: { attrs: { disabled: ["disabled"], multiple: ["multiple"] } },
  datalist: { attrs: { data: null } },
  dd: S,
  del: { attrs: { cite: null, datetime: null } },
  details: { attrs: { open: ["open"] } },
  dfn: S,
  div: S,
  dl: S,
  dt: S,
  em: S,
  embed: { attrs: { src: null, type: null, width: null, height: null } },
  eventsource: { attrs: { src: null } },
  fieldset: { attrs: { disabled: ["disabled"], form: null, name: null } },
  figcaption: S,
  figure: S,
  footer: S,
  form: {
    attrs: {
      action: null,
      name: null,
      "accept-charset": Charsets,
      autocomplete: ["on", "off"],
      enctype: Encs,
      method: Methods,
      novalidate: ["novalidate"],
      target: Targets
    }
  },
  h1: S,
  h2: S,
  h3: S,
  h4: S,
  h5: S,
  h6: S,
  head: {
    children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
  },
  header: S,
  hgroup: S,
  hr: S,
  html: {
    attrs: { manifest: null }
  },
  i: S,
  iframe: {
    attrs: {
      src: null,
      srcdoc: null,
      name: null,
      width: null,
      height: null,
      sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
      seamless: ["seamless"]
    }
  },
  img: {
    attrs: {
      alt: null,
      src: null,
      ismap: null,
      usemap: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"]
    }
  },
  input: {
    attrs: {
      alt: null,
      dirname: null,
      form: null,
      formaction: null,
      height: null,
      list: null,
      max: null,
      maxlength: null,
      min: null,
      name: null,
      pattern: null,
      placeholder: null,
      size: null,
      src: null,
      step: null,
      value: null,
      width: null,
      accept: ["audio/*", "video/*", "image/*"],
      autocomplete: ["on", "off"],
      autofocus: ["autofocus"],
      checked: ["checked"],
      disabled: ["disabled"],
      formenctype: Encs,
      formmethod: Methods,
      formnovalidate: ["novalidate"],
      formtarget: Targets,
      multiple: ["multiple"],
      readonly: ["readonly"],
      required: ["required"],
      type: [
        "hidden",
        "text",
        "search",
        "tel",
        "url",
        "email",
        "password",
        "datetime",
        "date",
        "month",
        "week",
        "time",
        "datetime-local",
        "number",
        "range",
        "color",
        "checkbox",
        "radio",
        "file",
        "submit",
        "image",
        "reset",
        "button"
      ]
    }
  },
  ins: { attrs: { cite: null, datetime: null } },
  kbd: S,
  keygen: {
    attrs: {
      challenge: null,
      form: null,
      name: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      keytype: ["RSA"]
    }
  },
  label: { attrs: { for: null, form: null } },
  legend: S,
  li: { attrs: { value: null } },
  link: {
    attrs: {
      href: null,
      type: null,
      hreflang: null,
      media: null,
      sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
    }
  },
  map: { attrs: { name: null } },
  mark: S,
  menu: { attrs: { label: null, type: ["list", "context", "toolbar"] } },
  meta: {
    attrs: {
      content: null,
      charset: Charsets,
      name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
      "http-equiv": ["content-language", "content-type", "default-style", "refresh"]
    }
  },
  meter: { attrs: { value: null, min: null, low: null, high: null, max: null, optimum: null } },
  nav: S,
  noscript: S,
  object: {
    attrs: {
      data: null,
      type: null,
      name: null,
      usemap: null,
      form: null,
      width: null,
      height: null,
      typemustmatch: ["typemustmatch"]
    }
  },
  ol: {
    attrs: { reversed: ["reversed"], start: null, type: ["1", "a", "A", "i", "I"] },
    children: ["li", "script", "template", "ul", "ol"]
  },
  optgroup: { attrs: { disabled: ["disabled"], label: null } },
  option: { attrs: { disabled: ["disabled"], label: null, selected: ["selected"], value: null } },
  output: { attrs: { for: null, form: null, name: null } },
  p: S,
  param: { attrs: { name: null, value: null } },
  pre: S,
  progress: { attrs: { value: null, max: null } },
  q: { attrs: { cite: null } },
  rp: S,
  rt: S,
  ruby: S,
  samp: S,
  script: {
    attrs: {
      type: ["text/javascript"],
      src: null,
      async: ["async"],
      defer: ["defer"],
      charset: Charsets
    }
  },
  section: S,
  select: {
    attrs: {
      form: null,
      name: null,
      size: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      multiple: ["multiple"]
    }
  },
  slot: { attrs: { name: null } },
  small: S,
  source: { attrs: { src: null, type: null, media: null } },
  span: S,
  strong: S,
  style: {
    attrs: {
      type: ["text/css"],
      media: null,
      scoped: null
    }
  },
  sub: S,
  summary: S,
  sup: S,
  table: S,
  tbody: S,
  td: { attrs: { colspan: null, rowspan: null, headers: null } },
  template: S,
  textarea: {
    attrs: {
      dirname: null,
      form: null,
      maxlength: null,
      name: null,
      placeholder: null,
      rows: null,
      cols: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      readonly: ["readonly"],
      required: ["required"],
      wrap: ["soft", "hard"]
    }
  },
  tfoot: S,
  th: { attrs: { colspan: null, rowspan: null, headers: null, scope: ["row", "col", "rowgroup", "colgroup"] } },
  thead: S,
  time: { attrs: { datetime: null } },
  title: S,
  tr: S,
  track: {
    attrs: {
      src: null,
      label: null,
      default: null,
      kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
      srclang: null
    }
  },
  ul: { children: ["li", "script", "template", "ul", "ol"] },
  var: S,
  video: {
    attrs: {
      src: null,
      poster: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["auto", "metadata", "none"],
      autoplay: ["autoplay"],
      mediagroup: ["movie"],
      muted: ["muted"],
      controls: ["controls"]
    }
  },
  wbr: S
};
var GlobalAttrs = {
  accesskey: null,
  class: null,
  contenteditable: Bool,
  contextmenu: null,
  dir: ["ltr", "rtl", "auto"],
  draggable: ["true", "false", "auto"],
  dropzone: ["copy", "move", "link", "string:", "file:"],
  hidden: ["hidden"],
  id: null,
  inert: ["inert"],
  itemid: null,
  itemprop: null,
  itemref: null,
  itemscope: ["itemscope"],
  itemtype: null,
  lang: ["ar", "bn", "de", "en-GB", "en-US", "es", "fr", "hi", "id", "ja", "pa", "pt", "ru", "tr", "zh"],
  spellcheck: Bool,
  autocorrect: Bool,
  autocapitalize: Bool,
  style: null,
  tabindex: null,
  title: null,
  translate: ["yes", "no"],
  rel: ["stylesheet", "alternate", "author", "bookmark", "help", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"],
  role: /* @__PURE__ */ "alert application article banner button cell checkbox complementary contentinfo dialog document feed figure form grid gridcell heading img list listbox listitem main navigation region row rowgroup search switch tab table tabpanel textbox timer".split(" "),
  "aria-activedescendant": null,
  "aria-atomic": Bool,
  "aria-autocomplete": ["inline", "list", "both", "none"],
  "aria-busy": Bool,
  "aria-checked": ["true", "false", "mixed", "undefined"],
  "aria-controls": null,
  "aria-describedby": null,
  "aria-disabled": Bool,
  "aria-dropeffect": null,
  "aria-expanded": ["true", "false", "undefined"],
  "aria-flowto": null,
  "aria-grabbed": ["true", "false", "undefined"],
  "aria-haspopup": Bool,
  "aria-hidden": Bool,
  "aria-invalid": ["true", "false", "grammar", "spelling"],
  "aria-label": null,
  "aria-labelledby": null,
  "aria-level": null,
  "aria-live": ["off", "polite", "assertive"],
  "aria-multiline": Bool,
  "aria-multiselectable": Bool,
  "aria-owns": null,
  "aria-posinset": null,
  "aria-pressed": ["true", "false", "mixed", "undefined"],
  "aria-readonly": Bool,
  "aria-relevant": null,
  "aria-required": Bool,
  "aria-selected": ["true", "false", "undefined"],
  "aria-setsize": null,
  "aria-sort": ["ascending", "descending", "none", "other"],
  "aria-valuemax": null,
  "aria-valuemin": null,
  "aria-valuenow": null,
  "aria-valuetext": null
};
var eventAttributes = /* @__PURE__ */ "beforeunload copy cut dragstart dragover dragleave dragenter dragend drag paste focus blur change click load mousedown mouseenter mouseleave mouseup keydown keyup resize scroll unload".split(" ").map((n) => "on" + n);
for (let a of eventAttributes)
  GlobalAttrs[a] = null;
var Schema = class {
  constructor(extraTags, extraAttrs) {
    this.tags = { ...Tags, ...extraTags };
    this.globalAttrs = { ...GlobalAttrs, ...extraAttrs };
    this.allTags = Object.keys(this.tags);
    this.globalAttrNames = Object.keys(this.globalAttrs);
  }
};
Schema.default = /* @__PURE__ */ new Schema();
function elementName2(doc, tree, max = doc.length) {
  if (!tree)
    return "";
  let tag = tree.firstChild;
  let name = tag && tag.getChild("TagName");
  return name ? doc.sliceString(name.from, Math.min(name.to, max)) : "";
}
function findParentElement(tree, skip = false) {
  for (; tree; tree = tree.parent)
    if (tree.name == "Element") {
      if (skip)
        skip = false;
      else
        return tree;
    }
  return null;
}
function allowedChildren(doc, tree, schema) {
  let parentInfo = schema.tags[elementName2(doc, findParentElement(tree))];
  return (parentInfo === null || parentInfo === void 0 ? void 0 : parentInfo.children) || schema.allTags;
}
function openTags(doc, tree) {
  let open = [];
  for (let parent = findParentElement(tree); parent && !parent.type.isTop; parent = findParentElement(parent.parent)) {
    let tagName = elementName2(doc, parent);
    if (tagName && parent.lastChild.name == "CloseTag")
      break;
    if (tagName && open.indexOf(tagName) < 0 && (tree.name == "EndTag" || tree.from >= parent.firstChild.to))
      open.push(tagName);
  }
  return open;
}
var identifier3 = /^[:\-\.\w\u00b7-\uffff]*$/;
function completeTag(state, schema, tree, from, to) {
  let end = /\s*>/.test(state.sliceDoc(to, to + 5)) ? "" : ">";
  let parent = findParentElement(tree, tree.name == "StartTag" || tree.name == "TagName");
  return {
    from,
    to,
    options: allowedChildren(state.doc, parent, schema).map((tagName) => ({ label: tagName, type: "type" })).concat(openTags(state.doc, tree).map((tag, i) => ({
      label: "/" + tag,
      apply: "/" + tag + end,
      type: "type",
      boost: 99 - i
    }))),
    validFor: /^\/?[:\-\.\w\u00b7-\uffff]*$/
  };
}
function completeCloseTag(state, tree, from, to) {
  let end = /\s*>/.test(state.sliceDoc(to, to + 5)) ? "" : ">";
  return {
    from,
    to,
    options: openTags(state.doc, tree).map((tag, i) => ({ label: tag, apply: tag + end, type: "type", boost: 99 - i })),
    validFor: identifier3
  };
}
function completeStartTag(state, schema, tree, pos) {
  let options = [], level = 0;
  for (let tagName of allowedChildren(state.doc, tree, schema))
    options.push({ label: "<" + tagName, type: "type" });
  for (let open of openTags(state.doc, tree))
    options.push({ label: "</" + open + ">", type: "type", boost: 99 - level++ });
  return { from: pos, to: pos, options, validFor: /^<\/?[:\-\.\w\u00b7-\uffff]*$/ };
}
function completeAttrName(state, schema, tree, from, to) {
  let elt2 = findParentElement(tree), info = elt2 ? schema.tags[elementName2(state.doc, elt2)] : null;
  let localAttrs = info && info.attrs ? Object.keys(info.attrs) : [];
  let names = info && info.globalAttrs === false ? localAttrs : localAttrs.length ? localAttrs.concat(schema.globalAttrNames) : schema.globalAttrNames;
  return {
    from,
    to,
    options: names.map((attrName) => ({ label: attrName, type: "property" })),
    validFor: identifier3
  };
}
function completeAttrValue(state, schema, tree, from, to) {
  var _a;
  let nameNode = (_a = tree.parent) === null || _a === void 0 ? void 0 : _a.getChild("AttributeName");
  let options = [], token = void 0;
  if (nameNode) {
    let attrName = state.sliceDoc(nameNode.from, nameNode.to);
    let attrs = schema.globalAttrs[attrName];
    if (!attrs) {
      let elt2 = findParentElement(tree), info = elt2 ? schema.tags[elementName2(state.doc, elt2)] : null;
      attrs = (info === null || info === void 0 ? void 0 : info.attrs) && info.attrs[attrName];
    }
    if (attrs) {
      let base = state.sliceDoc(from, to).toLowerCase(), quoteStart = '"', quoteEnd = '"';
      if (/^['"]/.test(base)) {
        token = base[0] == '"' ? /^[^"]*$/ : /^[^']*$/;
        quoteStart = "";
        quoteEnd = state.sliceDoc(to, to + 1) == base[0] ? "" : base[0];
        base = base.slice(1);
        from++;
      } else {
        token = /^[^\s<>='"]*$/;
      }
      for (let value of attrs)
        options.push({ label: value, apply: quoteStart + value + quoteEnd, type: "constant" });
    }
  }
  return { from, to, options, validFor: token };
}
function htmlCompletionFor(schema, context) {
  let { state, pos } = context, tree = (0, import_language3.syntaxTree)(state).resolveInner(pos, -1), around = tree.resolve(pos);
  for (let scan = pos, before; around == tree && (before = tree.childBefore(scan)); ) {
    let last = before.lastChild;
    if (!last || !last.type.isError || last.from < last.to)
      break;
    around = tree = before;
    scan = last.from;
  }
  if (tree.name == "TagName") {
    return tree.parent && /CloseTag$/.test(tree.parent.name) ? completeCloseTag(state, tree, tree.from, pos) : completeTag(state, schema, tree, tree.from, pos);
  } else if (tree.name == "StartTag" || tree.name == "IncompleteTag") {
    return completeTag(state, schema, tree, pos, pos);
  } else if (tree.name == "StartCloseTag" || tree.name == "IncompleteCloseTag") {
    return completeCloseTag(state, tree, pos, pos);
  } else if (tree.name == "OpenTag" || tree.name == "SelfClosingTag" || tree.name == "AttributeName") {
    return completeAttrName(state, schema, tree, tree.name == "AttributeName" ? tree.from : pos, pos);
  } else if (tree.name == "Is" || tree.name == "AttributeValue" || tree.name == "UnquotedAttributeValue") {
    return completeAttrValue(state, schema, tree, tree.name == "Is" ? pos : tree.from, pos);
  } else if (context.explicit && (around.name == "Element" || around.name == "Text" || around.name == "Document")) {
    return completeStartTag(state, schema, tree, pos);
  } else {
    return null;
  }
}
function htmlCompletionSource(context) {
  return htmlCompletionFor(Schema.default, context);
}
function htmlCompletionSourceWith(config) {
  let { extraTags, extraGlobalAttributes: extraAttrs } = config;
  let schema = extraAttrs || extraTags ? new Schema(extraTags, extraAttrs) : Schema.default;
  return (context) => htmlCompletionFor(schema, context);
}
var jsonParser = /* @__PURE__ */ javascriptLanguage.parser.configure({ top: "SingleExpression" });
var defaultNesting = [
  {
    tag: "script",
    attrs: (attrs) => attrs.type == "text/typescript" || attrs.lang == "ts",
    parser: typescriptLanguage.parser
  },
  {
    tag: "script",
    attrs: (attrs) => attrs.type == "text/babel" || attrs.type == "text/jsx",
    parser: jsxLanguage.parser
  },
  {
    tag: "script",
    attrs: (attrs) => attrs.type == "text/typescript-jsx",
    parser: tsxLanguage.parser
  },
  {
    tag: "script",
    attrs(attrs) {
      return /^(importmap|speculationrules|application\/(.+\+)?json)$/i.test(attrs.type);
    },
    parser: jsonParser
  },
  {
    tag: "script",
    attrs(attrs) {
      return !attrs.type || /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(attrs.type);
    },
    parser: javascriptLanguage.parser
  },
  {
    tag: "style",
    attrs(attrs) {
      return (!attrs.lang || attrs.lang == "css") && (!attrs.type || /^(text\/)?(x-)?(stylesheet|css)$/i.test(attrs.type));
    },
    parser: cssLanguage.parser
  }
];
var defaultAttrs = /* @__PURE__ */ [
  {
    name: "style",
    parser: /* @__PURE__ */ cssLanguage.parser.configure({ top: "Styles" })
  }
].concat(/* @__PURE__ */ eventAttributes.map((name) => ({ name, parser: javascriptLanguage.parser })));
var htmlPlain = /* @__PURE__ */ import_language3.LRLanguage.define({
  name: "html",
  parser: /* @__PURE__ */ parser2.configure({
    props: [
      /* @__PURE__ */ import_language3.indentNodeProp.add({
        Element(context) {
          let after = /^(\s*)(<\/)?/.exec(context.textAfter);
          if (context.node.to <= context.pos + after[0].length)
            return context.continue();
          return context.lineIndent(context.node.from) + (after[2] ? 0 : context.unit);
        },
        "OpenTag CloseTag SelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit;
        },
        Document(context) {
          if (context.pos + /\s*/.exec(context.textAfter)[0].length < context.node.to)
            return context.continue();
          let endElt = null, close;
          for (let cur = context.node; ; ) {
            let last = cur.lastChild;
            if (!last || last.name != "Element" || last.to != cur.to)
              break;
            endElt = cur = last;
          }
          if (endElt && !((close = endElt.lastChild) && (close.name == "CloseTag" || close.name == "SelfClosingTag")))
            return context.lineIndent(endElt.from) + context.unit;
          return null;
        }
      }),
      /* @__PURE__ */ import_language3.foldNodeProp.add({
        Element(node) {
          let first = node.firstChild, last = node.lastChild;
          if (!first || first.name != "OpenTag")
            return null;
          return { from: first.to, to: last.name == "CloseTag" ? last.from : node.to };
        }
      }),
      /* @__PURE__ */ import_language3.bracketMatchingHandle.add({
        "OpenTag CloseTag": (node) => node.getChild("TagName")
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "<!--", close: "-->" } },
    indentOnInput: /^\s*<\/\w+\W$/,
    wordChars: "-_"
  }
});
var htmlLanguage = /* @__PURE__ */ htmlPlain.configure({
  wrap: /* @__PURE__ */ configureNesting(defaultNesting, defaultAttrs)
});
function html(config = {}) {
  let dialect = "", wrap;
  if (config.matchClosingTags === false)
    dialect = "noMatch";
  if (config.selfClosingTags === true)
    dialect = (dialect ? dialect + " " : "") + "selfClosing";
  if (config.nestedLanguages && config.nestedLanguages.length || config.nestedAttributes && config.nestedAttributes.length)
    wrap = configureNesting((config.nestedLanguages || []).concat(defaultNesting), (config.nestedAttributes || []).concat(defaultAttrs));
  let lang = wrap ? htmlPlain.configure({ wrap, dialect }) : dialect ? htmlLanguage.configure({ dialect }) : htmlLanguage;
  return new import_language3.LanguageSupport(lang, [
    htmlLanguage.data.of({ autocomplete: htmlCompletionSourceWith(config) }),
    config.autoCloseTags !== false ? autoCloseTags2 : [],
    javascript().support,
    css().support
  ]);
}
var selfClosers2 = /* @__PURE__ */ new Set(/* @__PURE__ */ "area base br col command embed frame hr img input keygen link meta param source track wbr menuitem".split(" "));
var autoCloseTags2 = /* @__PURE__ */ import_view2.EditorView.inputHandler.of((view, from, to, text, insertTransaction) => {
  if (view.composing || view.state.readOnly || from != to || text != ">" && text != "/" || !htmlLanguage.isActiveAt(view.state, from, -1))
    return false;
  let base = insertTransaction(), { state } = base;
  let closeTags = state.changeByRange((range) => {
    var _a, _b, _c;
    let didType = state.doc.sliceString(range.from - 1, range.to) == text;
    let { head } = range, after = (0, import_language3.syntaxTree)(state).resolveInner(head, -1), name;
    if (didType && text == ">" && after.name == "EndTag") {
      let tag = after.parent;
      if (((_b = (_a = tag.parent) === null || _a === void 0 ? void 0 : _a.lastChild) === null || _b === void 0 ? void 0 : _b.name) != "CloseTag" && (name = elementName2(state.doc, tag.parent, head)) && !selfClosers2.has(name)) {
        let to2 = head + (state.doc.sliceString(head, head + 1) === ">" ? 1 : 0);
        let insert = `</${name}>`;
        return { range, changes: { from: head, to: to2, insert } };
      }
    } else if (didType && text == "/" && after.name == "IncompleteCloseTag") {
      let tag = after.parent;
      if (after.from == head - 2 && ((_c = tag.lastChild) === null || _c === void 0 ? void 0 : _c.name) != "CloseTag" && (name = elementName2(state.doc, tag, head)) && !selfClosers2.has(name)) {
        let to2 = head + (state.doc.sliceString(head, head + 1) === ">" ? 1 : 0);
        let insert = `${name}>`;
        return {
          range: import_state2.EditorSelection.cursor(head + insert.length, -1),
          changes: { from: head, to: to2, insert }
        };
      }
    }
    return { range };
  });
  if (closeTags.changes.empty)
    return false;
  view.dispatch([
    base,
    state.update(closeTags, {
      userEvent: "input.complete",
      scrollIntoView: true
    })
  ]);
  return true;
});

// node_modules/@codemirror/lang-markdown/dist/index.js
var import_common5 = require("@lezer/common");
var data = /* @__PURE__ */ (0, import_language4.defineLanguageFacet)({ commentTokens: { block: { open: "<!--", close: "-->" } } });
var headingProp = /* @__PURE__ */ new import_common5.NodeProp();
var commonmark = /* @__PURE__ */ parser.configure({
  props: [
    /* @__PURE__ */ import_language4.foldNodeProp.add((type) => {
      return !type.is("Block") || type.is("Document") || isHeading(type) != null || isList(type) ? void 0 : (tree, state) => ({ from: state.doc.lineAt(tree.from).to, to: tree.to });
    }),
    /* @__PURE__ */ headingProp.add(isHeading),
    /* @__PURE__ */ import_language4.indentNodeProp.add({
      Document: () => null
    }),
    /* @__PURE__ */ import_language4.languageDataProp.add({
      Document: data
    })
  ]
});
function isHeading(type) {
  let match = /^(?:ATX|Setext)Heading(\d)$/.exec(type.name);
  return match ? +match[1] : void 0;
}
function isList(type) {
  return type.name == "OrderedList" || type.name == "BulletList";
}
function findSectionEnd(headerNode, level) {
  let last = headerNode;
  for (; ; ) {
    let next = last.nextSibling, heading;
    if (!next || (heading = isHeading(next.type)) != null && heading <= level)
      break;
    last = next;
  }
  return last.to;
}
var headerIndent = /* @__PURE__ */ import_language4.foldService.of((state, start, end) => {
  for (let node = (0, import_language4.syntaxTree)(state).resolveInner(end, -1); node; node = node.parent) {
    if (node.from < start)
      break;
    let heading = node.type.prop(headingProp);
    if (heading == null)
      continue;
    let upto = findSectionEnd(node, heading);
    if (upto > end)
      return { from: end, to: upto };
  }
  return null;
});
function mkLang(parser5) {
  return new import_language4.Language(data, parser5, [], "markdown");
}
var commonmarkLanguage = /* @__PURE__ */ mkLang(commonmark);
var extended = /* @__PURE__ */ commonmark.configure([GFM, Subscript, Superscript, Emoji, {
  props: [
    /* @__PURE__ */ import_language4.foldNodeProp.add({
      Table: (tree, state) => ({ from: state.doc.lineAt(tree.from).to, to: tree.to })
    })
  ]
}]);
var markdownLanguage = /* @__PURE__ */ mkLang(extended);
function getCodeParser(languages, defaultLanguage) {
  return (info) => {
    if (info && languages) {
      let found = null;
      info = /\S*/.exec(info)[0];
      if (typeof languages == "function")
        found = languages(info);
      else
        found = import_language4.LanguageDescription.matchLanguageName(languages, info, true);
      if (found instanceof import_language4.LanguageDescription)
        return found.support ? found.support.language.parser : import_language4.ParseContext.getSkippingParser(found.load());
      else if (found)
        return found.parser;
    }
    return defaultLanguage ? defaultLanguage.parser : null;
  };
}
var Context = class {
  constructor(node, from, to, spaceBefore, spaceAfter, type, item) {
    this.node = node;
    this.from = from;
    this.to = to;
    this.spaceBefore = spaceBefore;
    this.spaceAfter = spaceAfter;
    this.type = type;
    this.item = item;
  }
  blank(maxWidth, trailing = true) {
    let result = this.spaceBefore + (this.node.name == "Blockquote" ? ">" : "");
    if (maxWidth != null) {
      while (result.length < maxWidth)
        result += " ";
      return result;
    } else {
      for (let i = this.to - this.from - result.length - this.spaceAfter.length; i > 0; i--)
        result += " ";
      return result + (trailing ? this.spaceAfter : "");
    }
  }
  marker(doc, add) {
    let number = this.node.name == "OrderedList" ? String(+itemNumber(this.item, doc)[2] + add) : "";
    return this.spaceBefore + number + this.type + this.spaceAfter;
  }
};
function getContext(node, doc) {
  let nodes = [], context = [];
  for (let cur = node; cur; cur = cur.parent) {
    if (cur.name == "FencedCode")
      return context;
    if (cur.name == "ListItem" || cur.name == "Blockquote")
      nodes.push(cur);
  }
  for (let i = nodes.length - 1; i >= 0; i--) {
    let node2 = nodes[i], match;
    let line = doc.lineAt(node2.from), startPos = node2.from - line.from;
    if (node2.name == "Blockquote" && (match = /^ *>( ?)/.exec(line.text.slice(startPos)))) {
      context.push(new Context(node2, startPos, startPos + match[0].length, "", match[1], ">", null));
    } else if (node2.name == "ListItem" && node2.parent.name == "OrderedList" && (match = /^( *)\d+([.)])( *)/.exec(line.text.slice(startPos)))) {
      let after = match[3], len = match[0].length;
      if (after.length >= 4) {
        after = after.slice(0, after.length - 4);
        len -= 4;
      }
      context.push(new Context(node2.parent, startPos, startPos + len, match[1], after, match[2], node2));
    } else if (node2.name == "ListItem" && node2.parent.name == "BulletList" && (match = /^( *)([-+*])( {1,4}\[[ xX]\])?( +)/.exec(line.text.slice(startPos)))) {
      let after = match[4], len = match[0].length;
      if (after.length > 4) {
        after = after.slice(0, after.length - 4);
        len -= 4;
      }
      let type = match[2];
      if (match[3])
        type += match[3].replace(/[xX]/, " ");
      context.push(new Context(node2.parent, startPos, startPos + len, match[1], after, type, node2));
    }
  }
  return context;
}
function itemNumber(item, doc) {
  return /^(\s*)(\d+)(?=[.)])/.exec(doc.sliceString(item.from, item.from + 10));
}
function renumberList(after, doc, changes, offset = 0) {
  for (let prev = -1, node = after; ; ) {
    if (node.name == "ListItem") {
      let m = itemNumber(node, doc);
      let number = +m[2];
      if (prev >= 0) {
        if (number != prev + 1)
          return;
        changes.push({ from: node.from + m[1].length, to: node.from + m[0].length, insert: String(prev + 2 + offset) });
      }
      prev = number;
    }
    let next = node.nextSibling;
    if (!next)
      break;
    node = next;
  }
}
function normalizeIndent(content, state) {
  let blank = /^[ \t]*/.exec(content)[0].length;
  if (!blank || state.facet(import_language4.indentUnit) != "	")
    return content;
  let col = (0, import_state3.countColumn)(content, 4, blank);
  let space4 = "";
  for (let i = col; i > 0; ) {
    if (i >= 4) {
      space4 += "	";
      i -= 4;
    } else {
      space4 += " ";
      i--;
    }
  }
  return space4 + content.slice(blank);
}
var insertNewlineContinueMarkupCommand = (config = {}) => ({ state, dispatch }) => {
  let tree = (0, import_language4.syntaxTree)(state), { doc } = state;
  let dont = null, changes = state.changeByRange((range) => {
    if (!range.empty || !markdownLanguage.isActiveAt(state, range.from, -1) && !markdownLanguage.isActiveAt(state, range.from, 1))
      return dont = { range };
    let pos = range.from, line = doc.lineAt(pos);
    let context = getContext(tree.resolveInner(pos, -1), doc);
    while (context.length && context[context.length - 1].from > pos - line.from)
      context.pop();
    if (!context.length)
      return dont = { range };
    let inner = context[context.length - 1];
    if (inner.to - inner.spaceAfter.length > pos - line.from)
      return dont = { range };
    let emptyLine = pos >= inner.to - inner.spaceAfter.length && !/\S/.test(line.text.slice(inner.to));
    if (inner.item && emptyLine) {
      let first = inner.node.firstChild, second = inner.node.getChild("ListItem", "ListItem");
      if (first.to >= pos || second && second.to < pos || line.from > 0 && !/[^\s>]/.test(doc.lineAt(line.from - 1).text) || config.nonTightLists === false) {
        let next = context.length > 1 ? context[context.length - 2] : null;
        let delTo, insert2 = "";
        if (next && next.item) {
          delTo = line.from + next.from;
          insert2 = next.marker(doc, 1);
        } else {
          delTo = line.from + (next ? next.to : 0);
        }
        let changes3 = [{ from: delTo, to: pos, insert: insert2 }];
        if (inner.node.name == "OrderedList")
          renumberList(inner.item, doc, changes3, -2);
        if (next && next.node.name == "OrderedList")
          renumberList(next.item, doc, changes3);
        return { range: import_state3.EditorSelection.cursor(delTo + insert2.length), changes: changes3 };
      } else {
        let insert2 = blankLine(context, state, line);
        return {
          range: import_state3.EditorSelection.cursor(pos + insert2.length + 1),
          changes: { from: line.from, insert: insert2 + state.lineBreak }
        };
      }
    }
    if (inner.node.name == "Blockquote" && emptyLine && line.from) {
      let prevLine = doc.lineAt(line.from - 1), quoted = />\s*$/.exec(prevLine.text);
      if (quoted && quoted.index == inner.from) {
        let changes3 = state.changes([
          { from: prevLine.from + quoted.index, to: prevLine.to },
          { from: line.from + inner.from, to: line.to }
        ]);
        return { range: range.map(changes3), changes: changes3 };
      }
    }
    let changes2 = [];
    if (inner.node.name == "OrderedList")
      renumberList(inner.item, doc, changes2);
    let continued = inner.item && inner.item.from < line.from;
    let insert = "";
    if (!continued || /^[\s\d.)\-+*>]*/.exec(line.text)[0].length >= inner.to) {
      for (let i = 0, e = context.length - 1; i <= e; i++) {
        insert += i == e && !continued ? context[i].marker(doc, 1) : context[i].blank(i < e ? (0, import_state3.countColumn)(line.text, 4, context[i + 1].from) - insert.length : null);
      }
    }
    let from = pos;
    while (from > line.from && /\s/.test(line.text.charAt(from - line.from - 1)))
      from--;
    insert = normalizeIndent(insert, state);
    if (nonTightList(inner.node, state.doc))
      insert = blankLine(context, state, line) + state.lineBreak + insert;
    changes2.push({ from, to: pos, insert: state.lineBreak + insert });
    return { range: import_state3.EditorSelection.cursor(from + insert.length + 1), changes: changes2 };
  });
  if (dont)
    return false;
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
  return true;
};
var insertNewlineContinueMarkup = /* @__PURE__ */ insertNewlineContinueMarkupCommand();
function isMark(node) {
  return node.name == "QuoteMark" || node.name == "ListMark";
}
function nonTightList(node, doc) {
  if (node.name != "OrderedList" && node.name != "BulletList")
    return false;
  let first = node.firstChild, second = node.getChild("ListItem", "ListItem");
  if (!second)
    return false;
  let line1 = doc.lineAt(first.to), line2 = doc.lineAt(second.from);
  let empty = /^[\s>]*$/.test(line1.text);
  return line1.number + (empty ? 0 : 1) < line2.number;
}
function blankLine(context, state, line) {
  let insert = "";
  for (let i = 0, e = context.length - 2; i <= e; i++) {
    insert += context[i].blank(i < e ? (0, import_state3.countColumn)(line.text, 4, context[i + 1].from) - insert.length : null, i < e);
  }
  return normalizeIndent(insert, state);
}
function contextNodeForDelete(tree, pos) {
  let node = tree.resolveInner(pos, -1), scan = pos;
  if (isMark(node)) {
    scan = node.from;
    node = node.parent;
  }
  for (let prev; prev = node.childBefore(scan); ) {
    if (isMark(prev)) {
      scan = prev.from;
    } else if (prev.name == "OrderedList" || prev.name == "BulletList") {
      node = prev.lastChild;
      scan = node.to;
    } else {
      break;
    }
  }
  return node;
}
var deleteMarkupBackward = ({ state, dispatch }) => {
  let tree = (0, import_language4.syntaxTree)(state);
  let dont = null, changes = state.changeByRange((range) => {
    let pos = range.from, { doc } = state;
    if (range.empty && markdownLanguage.isActiveAt(state, range.from)) {
      let line = doc.lineAt(pos);
      let context = getContext(contextNodeForDelete(tree, pos), doc);
      if (context.length) {
        let inner = context[context.length - 1];
        let spaceEnd = inner.to - inner.spaceAfter.length + (inner.spaceAfter ? 1 : 0);
        if (pos - line.from > spaceEnd && !/\S/.test(line.text.slice(spaceEnd, pos - line.from)))
          return {
            range: import_state3.EditorSelection.cursor(line.from + spaceEnd),
            changes: { from: line.from + spaceEnd, to: pos }
          };
        if (pos - line.from == spaceEnd && // Only apply this if we're on the line that has the
        // construct's syntax, or there's only indentation in the
        // target range
        (!inner.item || line.from <= inner.item.from || !/\S/.test(line.text.slice(0, inner.to)))) {
          let start = line.from + inner.from;
          if (inner.item && inner.node.from < inner.item.from && /\S/.test(line.text.slice(inner.from, inner.to))) {
            let insert = inner.blank((0, import_state3.countColumn)(line.text, 4, inner.to) - (0, import_state3.countColumn)(line.text, 4, inner.from));
            if (start == line.from)
              insert = normalizeIndent(insert, state);
            return {
              range: import_state3.EditorSelection.cursor(start + insert.length),
              changes: { from: start, to: line.from + inner.to, insert }
            };
          }
          if (start < pos)
            return { range: import_state3.EditorSelection.cursor(start), changes: { from: start, to: pos } };
        }
      }
    }
    return dont = { range };
  });
  if (dont)
    return false;
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "delete" }));
  return true;
};
var markdownKeymap = [
  { key: "Enter", run: insertNewlineContinueMarkup },
  { key: "Backspace", run: deleteMarkupBackward }
];
var htmlNoMatch = /* @__PURE__ */ html({ matchClosingTags: false });
function markdown(config = {}) {
  let { codeLanguages, defaultCodeLanguage, addKeymap = true, base: { parser: parser5 } = commonmarkLanguage, completeHTMLTags = true, pasteURLAsLink: pasteURL = true, htmlTagLanguage = htmlNoMatch } = config;
  if (!(parser5 instanceof MarkdownParser))
    throw new RangeError("Base parser provided to `markdown` should be a Markdown parser");
  let extensions = config.extensions ? [config.extensions] : [];
  let support = [htmlTagLanguage.support, headerIndent], defaultCode;
  if (pasteURL)
    support.push(pasteURLAsLink);
  if (defaultCodeLanguage instanceof import_language4.LanguageSupport) {
    support.push(defaultCodeLanguage.support);
    defaultCode = defaultCodeLanguage.language;
  } else if (defaultCodeLanguage) {
    defaultCode = defaultCodeLanguage;
  }
  let codeParser = codeLanguages || defaultCode ? getCodeParser(codeLanguages, defaultCode) : void 0;
  extensions.push(parseCode({ codeParser, htmlParser: htmlTagLanguage.language.parser }));
  if (addKeymap)
    support.push(import_state3.Prec.high(import_view3.keymap.of(markdownKeymap)));
  let lang = mkLang(parser5.configure(extensions));
  if (completeHTMLTags)
    support.push(lang.data.of({ autocomplete: htmlTagCompletion }));
  return new import_language4.LanguageSupport(lang, support);
}
function htmlTagCompletion(context) {
  let { state, pos } = context, m = /<[:\-\.\w\u00b7-\uffff]*$/.exec(state.sliceDoc(pos - 25, pos));
  if (!m)
    return null;
  let tree = (0, import_language4.syntaxTree)(state).resolveInner(pos, -1);
  while (tree && !tree.type.isTop) {
    if (tree.name == "CodeBlock" || tree.name == "FencedCode" || tree.name == "ProcessingInstructionBlock" || tree.name == "CommentBlock" || tree.name == "Link" || tree.name == "Image")
      return null;
    tree = tree.parent;
  }
  return {
    from: pos - m[0].length,
    to: pos,
    options: htmlTagCompletions(),
    validFor: /^<[:\-\.\w\u00b7-\uffff]*$/
  };
}
var _tagCompletions = null;
function htmlTagCompletions() {
  if (_tagCompletions)
    return _tagCompletions;
  let result = htmlCompletionSource(new import_autocomplete2.CompletionContext(import_state3.EditorState.create({ extensions: htmlNoMatch }), 0, true));
  return _tagCompletions = result ? result.options : [];
}
var nonPlainText = /code|horizontalrule|html|link|comment|processing|escape|entity|image|mark|url/i;
var pasteURLAsLink = /* @__PURE__ */ import_view3.EditorView.domEventHandlers({
  paste: (event, view) => {
    var _a;
    let { main } = view.state.selection;
    if (main.empty)
      return false;
    let link = (_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
    if (!link || !/^(https?:\/\/|mailto:|xmpp:|www\.)/.test(link))
      return false;
    if (/^www\./.test(link))
      link = "https://" + link;
    if (!markdownLanguage.isActiveAt(view.state, main.from, 1))
      return false;
    let tree = (0, import_language4.syntaxTree)(view.state), crossesNode = false;
    tree.iterate({
      from: main.from,
      to: main.to,
      enter: (node) => {
        if (node.from > main.from || nonPlainText.test(node.name))
          crossesNode = true;
      },
      leave: (node) => {
        if (node.to < main.to)
          crossesNode = true;
      }
    });
    if (crossesNode)
      return false;
    view.dispatch({
      changes: [{ from: main.from, insert: "[" }, { from: main.to, insert: `](${link})` }],
      userEvent: "input.paste",
      scrollIntoView: true
    });
    return true;
  }
});

// src/recorder-view.ts
var import_highlight5 = require("@lezer/highlight");

// src/gemini.ts
var GROQ_BASE = "https://api.groq.com/openai/v1";
async function transcribeAudio(blob, apiKey) {
  const form = new FormData();
  form.append("file", blob, "recording.webm");
  form.append("model", "whisper-large-v3-turbo");
  const res = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq transcription ${res.status}${detail ? ": " + detail : ""}`);
  }
  const data2 = await res.json();
  return data2.text;
}
async function generateFeedback(studentNotes, aiNotes, apiKey) {
  const [confusionItems, knowledgeItems] = await Promise.all([
    detectConfusion(studentNotes, apiKey),
    checkKnowledge(studentNotes, aiNotes, apiKey)
  ]);
  return [...confusionItems, ...knowledgeItems];
}
async function filterResolvedFeedback(originalItems, updatedNotes, apiKey) {
  if (originalItems.length === 0) return [];
  const itemSummary = originalItems.map((f) => ({
    id: f.id,
    type: f.type,
    studentText: f.studentText || "",
    question: f.question,
    answer: f.answer
  }));
  const text = await groqChat(apiKey, `Review these feedback issues against updated student notes. Determine which are STILL present and unresolved.

Original issues:
${JSON.stringify(itemSummary, null, 2)}

Updated student notes:
${updatedNotes}

For each issue decide:
- "missing": has the student now added this concept? If yes \u2192 resolved.
- "incorrect": is the incorrect statement gone or corrected? If yes \u2192 resolved.
- "incomplete": is it now explained sufficiently? If yes \u2192 resolved.
- "verbose": has the verbose passage been meaningfully shortened? If yes \u2192 resolved.
- "unclear": has the unclear passage been rewritten clearly? If yes \u2192 resolved.

Return ONLY a raw JSON array of IDs that are STILL UNRESOLVED. Do not include IDs that have been fixed.
["f0", "f2", ...]

If all issues are resolved, return [].`);
  const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    return originalItems.map((f) => f.id);
  }
}
async function detectConfusion(studentNotes, apiKey) {
  const text = await groqChat(apiKey, `Read these student notes and flag every moment that strikes you as confused, uncertain, sloppy, or unprofessional. Use your own judgement \u2014 don't hold back. If something feels off, flag it.

Return ONLY a raw JSON array \u2014 no markdown, no explanation:
[
  {
    "studentText": "the exact phrase from the notes that has the problem (as short as possible)",
    "question": "a Socratic question that makes the student realize why this is a problem",
    "hints": ["gentle nudge", "more direct", "almost gives it away"],
    "answer": "what is wrong and what to write instead",
    "type": "unclear"
  }
]

Student Notes:
${studentNotes}`);
  const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    return [];
  }
}
async function checkKnowledge(studentNotes, aiNotes, apiKey) {
  const text = await groqChat(apiKey, `Compare these student notes against the reference notes. Flag whatever you think is wrong \u2014 missing ideas, incorrect facts, things not explained well enough, anything over-explained. Use your judgement on what matters.

Return ONLY a raw JSON array \u2014 no markdown fences, no explanation:
[
  {
    "studentText": "exact phrase from student notes, or empty string if something is completely missing",
    "question": "Socratic question nudging them toward the issue",
    "hints": ["subtle nudge", "more direct", "almost gives it away"],
    "answer": "what is wrong and why it matters",
    "type": "missing|incorrect|incomplete|verbose"
  }
]

Type meanings:
- "incomplete": mentioned but not explained enough
- "missing": important idea completely absent \u2014 use empty studentText
- "incorrect": factually wrong
- "verbose": over-explained, should be shorter

Reference Notes:
${aiNotes}

Student Notes:
${studentNotes}`);
  const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    return [];
  }
}
async function groqChat(apiKey, prompt) {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}${detail ? ": " + detail : ""}`);
  }
  const data2 = await res.json();
  return data2.choices[0].message.content;
}
async function generateNextHint(item, previousHints, apiKey) {
  return groqChat(apiKey, `A student is struggling with feedback on their notes. Generate the next progressive hint.

Issue type: ${item.type}
${item.studentText ? `Their text: "${item.studentText}"` : ""}
Question asked: ${item.question}
${previousHints.length > 0 ? `Previous hints already given:
${previousHints.map((h, i) => `${i + 1}. ${h}`).join("\n")}` : ""}

Write only the next hint \u2014 more direct than the previous ones but still don't give away the full answer. Return only the hint text, nothing else.`);
}
async function groupFeedbackIntoSections(feedbackItems, studentNotes, aiNotes, apiKey) {
  const itemSummary = feedbackItems.map((f) => ({
    id: f.id,
    type: f.type,
    studentText: f.studentText || ""
  }));
  const raw = await groqChat(apiKey, `Assign these feedback items to topic sections from the lecture.

Feedback items:
${JSON.stringify(itemSummary, null, 2)}

AI Reference Notes:
${aiNotes}

Student Notes:
${studentNotes}

Create 4\u20136 sections based strictly on LECTURE TOPICS (e.g. "Cell Membrane Structure", "DNA Replication"). Never create sections named "Common Issues", "Miscellaneous", "General Notes", "Other Issues", or any issue-type category.

Assign every feedback item to exactly one section. Sections with no issues are allowed (good coverage).

aiScore: how well the student covered this topic (9\u201310 = no issues; 7\u20138 = minor; 5\u20136 = moderate; 3\u20134 = serious gaps; 1\u20132 = mostly wrong/missing).

Return ONLY a raw JSON array, no markdown:
[{
  "title": "lecture topic name",
  "studentExcerpt": "exact quote \u226415 words from student notes for this topic, or empty string",
  "aiScore": <1\u201310 integer>,
  "feedbackIds": ["f0", "f3", ...]
}]`);
  const cleaned = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  const sections = JSON.parse(cleaned);
  const meta = /common\s*issue|miscellaneous|general\s*note|^other$|^summary$/i;
  return sections.filter((s) => !meta.test(s.title.trim()));
}
async function generateComparisonFeedback(sections, feedbackItems, userScores, apiKey) {
  const byId = new Map(feedbackItems.map((f) => [f.id, f]));
  const payload = sections.map((s, i) => ({
    title: s.title,
    userScore: userScores[i],
    aiScore: s.aiScore,
    issueCount: s.feedbackIds.length,
    issues: s.feedbackIds.map((id) => {
      var _a;
      return (_a = byId.get(id)) == null ? void 0 : _a.type;
    }).filter(Boolean)
  }));
  const raw = await groqChat(apiKey, `A student rated their own notes section-by-section. Compare each self-rating to the AI's assessment and write one short Socratic response per section.

Rules:
- If user overrated (user > AI by 2+): point out the gap directly. Name the specific issues. Ask what they think they missed.
- If user underrated (AI > user by 2+): acknowledge their self-doubt but show the notes are stronger than they think.
- If accurate (within 1\u20132): validate their self-awareness briefly.

Keep each response to 1\u20132 sentences. Be direct and specific.

Sections:
${JSON.stringify(payload, null, 2)}

Return ONLY a raw JSON array of strings, one per section, no markdown:
["feedback for section 0", "feedback for section 1", ...]`);
  return JSON.parse(raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim());
}
async function generateQuizQuestions(transcript, aiNotes, apiKey) {
  return JSON.parse(
    (await groqChat(apiKey, `Generate 6 study questions for a student. Base everything ONLY on the lecture below \u2014 do not use outside knowledge. Every question and answer must come directly from this lecture's content.

Generate exactly:
- 2 of type "explain": Ask the student to explain a core concept simply, as if to someone with no background (Feynman technique). Start with "Explain..." or "In your own words, what is..."
- 2 of type "whatif": Hypothetical application questions that extend a concept from the lecture. Start with "What if..."
- 2 of type "quiz": Direct factual questions that could appear on a real exam about this specific lecture.

Return ONLY a raw JSON array, no markdown:
[{ "type": "explain|whatif|quiz", "question": "...", "sampleAnswer": "concise model answer from lecture content only" }]

Lecture Transcript:
${transcript}

Lecture Notes:
${aiNotes}`)).replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim()
  );
}
async function evaluateAnswer(question3, studentAnswer, transcript, apiKey) {
  const raw = await groqChat(apiKey, `Evaluate a student's answer based ONLY on the lecture transcript below. Do not use outside knowledge.

Question: ${question3.question}
Expected answer (reference): ${question3.sampleAnswer}
Student's answer: ${studentAnswer}

Lecture:
${transcript}

Return ONLY a raw JSON object, no markdown:
{ "score": "good|partial|needs-work", "feedback": "1-2 sentences of specific feedback grounded in the lecture" }

Scoring: "good" = correct and reasonably complete; "partial" = right idea but missing key detail; "needs-work" = incorrect or too vague`);
  return JSON.parse(raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim());
}
async function generateNotes(transcript, apiKey) {
  return groqChat(apiKey, `You are a note-taking assistant. Convert this lecture transcript into clear, structured notes. Use markdown with headings (##), bullet points, and **bold** for key terms. Be concise \u2014 capture the key ideas, not every word.

Transcript:
${transcript}`);
}

// src/sample-data.ts
var TEST_MODE = true;
var SAMPLE_TRANSCRIPT = `
Alright everyone, settle down, let's get started. Today we're going to be talking about naming alkanes,
which is part of our unit on organic chemistry nomenclature. This is IUPAC naming, so the International
Union of Pure and Applied Chemistry \u2014 they set the rules that chemists worldwide follow so everyone's
on the same page.

So first things first, what is an alkane? Alkanes are hydrocarbons \u2014 meaning they only contain carbon
and hydrogen \u2014 and they have only single bonds between carbons. We call them saturated hydrocarbons
because they're saturated with hydrogen. The general formula is C n H 2n plus 2. So for one carbon,
methane, you get CH4. Two carbons, ethane, C2H6. Three carbons, propane, C3H8. You see the pattern.

Now the first four names \u2014 methane, ethane, propane, butane \u2014 those you just have to memorize, they're
from old common names. From five carbons onwards, the prefix is Greek: penta, hexa, hepta, octa, nona,
deca. Five carbons is pentane, six is hexane, and so on.

Okay so how do we name a branched alkane? Here are the steps. Step one: find the longest carbon chain.
That becomes your parent chain and tells you the base name. If your longest chain is seven carbons,
you're looking at heptane. Step two: number the carbons in that chain so that the substituents \u2014 the
branches \u2014 get the lowest possible numbers. So if you have a branch, you start numbering from the end
closest to it.

Step three: name the substituents. A branch that's just one carbon is called a methyl group. Two carbons
is ethyl. And you put the number of the carbon it's attached to as a prefix, like 2-methyl or 3-ethyl.

Step four: if you have multiple substituents of the same type, use di, tri, tetra as prefixes. So two
methyl groups is dimethyl, three is trimethyl.

Step five \u2014 and this one students always forget \u2014 when you have different substituents, you list them
in alphabetical order. Not based on their position numbers, alphabetical. So ethyl comes before methyl.
The di and tri prefixes don't count for alphabetical order, by the way.

Finally you put it all together: substituents listed alphabetically with their position numbers,
then the parent chain name. Like 3-ethyl-2-methylpentane. The parent chain is pentane, five carbons,
there's an ethyl group on carbon 3 and a methyl group on carbon 2.

One common mistake: students sometimes choose a shorter chain because the longer chain is harder to
see when the molecule is drawn in a zig-zag. Always make sure you've found the absolute longest chain.

Alright, we'll do some practice problems next.
`.trim();
var SAMPLE_AI_NOTES = `
## Alkanes \u2014 Definition and Formula

- **Alkanes** are saturated hydrocarbons: contain only C and H, single bonds only
- General formula: **C\u2099H\u2082\u2099\u208A\u2082**
- First four names are memorized: **methane, ethane, propane, butane**
- C5 onwards use Greek prefixes: penta-, hexa-, hepta-, octa-, nona-, deca-

## IUPAC Naming Steps for Branched Alkanes

1. **Find the longest carbon chain** \u2192 this is the parent chain (gives the base name)
2. **Number the chain** from the end closest to a substituent (lowest locants rule)
3. **Name substituents** with their position number (e.g. 2-methyl, 3-ethyl)
   - 1 C branch = **methyl**, 2 C branch = **ethyl**
4. **Multiple identical substituents** \u2192 use di-, tri-, tetra- prefixes
5. **List substituents alphabetically** (di/tri prefixes are ignored for alphabetical order)

## Putting It Together

- Format: *[substituents alphabetically with locants]-[parent chain name]*
- Example: **3-ethyl-2-methylpentane**
  - Parent chain: pentane (5 C)
  - Ethyl on C3, methyl on C2
  - Ethyl listed before methyl (alphabetical)

## Common Mistakes

- **Missing the longest chain** \u2014 always double-check zig-zag drawn structures
- Forgetting alphabetical order and using numerical order instead
- Counting di/tri when alphabetizing (don't \u2014 ignore them)
`.trim();

// src/recorder-view.ts
var RECORDER_VIEW_TYPE = "didyouevenlisten-recorder";
var setHighlights = import_state4.StateEffect.define();
var addHighlight = import_state4.StateEffect.define();
var highlightField = import_state4.StateField.define({
  create() {
    return import_view4.Decoration.none;
  },
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setHighlights)) {
        const sorted = [...effect.value].sort((a, b) => a.from - b.from);
        const builder = new import_state4.RangeSetBuilder();
        for (const { from, to, id, type } of sorted) {
          builder.add(from, to, import_view4.Decoration.mark({ class: `nr-highlight nr-hl-${id} nr-hl-type-${type}` }));
        }
        deco = builder.finish();
      } else if (effect.is(addHighlight)) {
        const { from, to, id, type } = effect.value;
        deco = deco.update({
          add: [import_view4.Decoration.mark({ class: `nr-highlight nr-hl-${id} nr-hl-type-${type}` }).range(from, to)],
          sort: true
        });
      }
    }
    return deco;
  },
  provide: (f) => import_view4.EditorView.decorations.from(f)
});
var FeedbackModal = class extends import_obsidian.Modal {
  constructor(app, item, apiKey, onGiveUp) {
    super(app);
    this.didGiveUp = false;
    this.item = item;
    this.apiKey = apiKey;
    this.onGiveUp = onGiveUp;
  }
  onOpen() {
    var _a, _b;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("nr-feedback-modal");
    this.modalEl.style.opacity = "0";
    this.modalEl.style.transform = "translateY(6px)";
    this.modalEl.style.transition = "opacity 0.22s ease, transform 0.22s ease";
    requestAnimationFrame(() => {
      this.modalEl.style.opacity = "1";
      this.modalEl.style.transform = "translateY(0)";
    });
    const typeLabel = {
      incomplete: "Expand this",
      missing: "Add this concept",
      incorrect: "Incorrect",
      verbose: "Too verbose \u2014 shorten",
      unclear: "Rewrite more clearly"
    };
    contentEl.createEl("span", {
      text: (_a = typeLabel[this.item.type]) != null ? _a : this.item.type,
      cls: `nr-type-badge nr-type-${this.item.type}`
    });
    if (this.item.studentText) {
      contentEl.createDiv("nr-feedback-quote").createEl("p", {
        text: `"${this.item.studentText}"`
      });
    }
    contentEl.createEl("p", { text: this.item.question, cls: "nr-feedback-question" });
    const hintsContainer = contentEl.createDiv("nr-hints-container");
    const shownHints = [];
    const hintBtn = contentEl.createEl("button", {
      text: "I'm stuck \u2014 give me a hint",
      cls: "nr-hint-btn"
    });
    const giveUpBtn = contentEl.createEl("button", {
      text: "I give up \u2014 just tell me",
      cls: "nr-giveup-btn"
    });
    const answerEl = contentEl.createDiv("nr-answer");
    answerEl.setText((_b = this.item.answer) != null ? _b : "");
    answerEl.style.display = "none";
    const addHint = (text) => {
      const n = shownHints.length;
      shownHints.push(text);
      const hintEl = hintsContainer.createDiv("nr-hint");
      const headerEl = hintEl.createDiv("nr-hint-header");
      headerEl.createEl("span", { text: `Hint ${n + 1}`, cls: "nr-hint-label" });
      const toggleBtn = headerEl.createEl("button", { cls: "nr-hint-toggle", attr: { "aria-label": "Toggle hint" } });
      toggleBtn.innerHTML = "\u25B2";
      const bodyEl = hintEl.createDiv("nr-hint-body");
      bodyEl.createEl("p", { text });
      let expanded = true;
      toggleBtn.addEventListener("click", () => {
        expanded = !expanded;
        bodyEl.style.display = expanded ? "block" : "none";
        toggleBtn.innerHTML = expanded ? "\u25B2" : "\u25BC";
      });
      hintBtn.setText("Give me another hint");
    };
    hintBtn.addEventListener("click", async () => {
      var _a2;
      hintBtn.disabled = true;
      hintBtn.setText("Thinking\u2026");
      const pregenerated = (_a2 = this.item.hints) != null ? _a2 : [];
      if (shownHints.length < pregenerated.length) {
        addHint(pregenerated[shownHints.length]);
        hintBtn.disabled = false;
      } else {
        try {
          const next = await generateNextHint(this.item, shownHints, this.apiKey);
          addHint(next);
        } catch (e) {
          hintBtn.setText("Couldn't load hint \u2014 try again");
        } finally {
          hintBtn.disabled = false;
        }
      }
    });
    giveUpBtn.addEventListener("click", () => {
      answerEl.style.display = "block";
      giveUpBtn.style.display = "none";
      hintBtn.style.display = "none";
      this.didGiveUp = true;
    });
  }
  onClose() {
    var _a;
    this.contentEl.empty();
    if (this.didGiveUp) (_a = this.onGiveUp) == null ? void 0 : _a.call(this);
  }
};
var markdownHighlight = import_language5.HighlightStyle.define([
  { tag: import_highlight5.tags.heading1, class: "cm-md-h1" },
  { tag: import_highlight5.tags.heading2, class: "cm-md-h2" },
  { tag: import_highlight5.tags.heading3, class: "cm-md-h3" },
  { tag: import_highlight5.tags.heading4, class: "cm-md-h4" },
  { tag: import_highlight5.tags.strong, class: "cm-md-strong" },
  { tag: import_highlight5.tags.emphasis, class: "cm-md-em" },
  { tag: import_highlight5.tags.strikethrough, class: "cm-md-strike" },
  { tag: import_highlight5.tags.monospace, class: "cm-md-code" },
  { tag: import_highlight5.tags.link, class: "cm-md-link" },
  { tag: import_highlight5.tags.url, class: "cm-md-url" },
  { tag: import_highlight5.tags.quote, class: "cm-md-quote" },
  { tag: import_highlight5.tags.list, class: "cm-md-list" },
  { tag: import_highlight5.tags.meta, class: "cm-md-meta" },
  { tag: import_highlight5.tags.processingInstruction, class: "cm-md-marker" },
  { tag: import_highlight5.tags.contentSeparator, class: "cm-md-hr" }
]);
var obsidianEditorTheme = import_view4.EditorView.theme({
  "&": { height: "100%", backgroundColor: "transparent", color: "var(--text-normal)", fontSize: "var(--font-text-size)", fontFamily: "var(--font-text)" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "inherit", lineHeight: "var(--line-height-normal, 1.6)", overflow: "auto" },
  ".cm-content": { padding: "2px 0", caretColor: "var(--caret-color, var(--text-normal))", minHeight: "100%" },
  ".cm-line": { padding: "0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--text-accent, var(--text-normal))" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { background: "var(--text-selection) !important" },
  ".cm-activeLine": { backgroundColor: "transparent" },
  ".cm-placeholder": { color: "var(--text-faint)", fontStyle: "italic" }
});
var RecorderView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.transcript = "";
    this.generatedMarkdown = "";
    this.feedbackItems = [];
    this.quizQuestions = [];
    this.timerInterval = null;
    this.seconds = 0;
    this.isRecording = false;
    this.savedVaultPath = null;
    // Metacognition state
    this.mode = "normal";
    this.metacogSections = [];
    this.metacogUserScores = [];
    this.metacogGivenUpSections = /* @__PURE__ */ new Set();
    this.highlightTimeouts = [];
    this.errorTimeout = null;
    this.brainResetTimeout = null;
    // Brain state
    this.brainScore = 0;
    this.brainSpeechTimeout = null;
    // Snapshot of notes at last feedback run — used to gate the Re-check button
    this.prevStudentNotes = "";
    // Canonical issue set from the first feedback run; rechecks can only shrink it
    this.initialFeedbackItems = [];
    this.plugin = plugin;
  }
  getViewType() {
    return RECORDER_VIEW_TYPE;
  }
  getDisplayText() {
    return "Did You Even Listen";
  }
  getIcon() {
    return "mic";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("nr-container");
    this.tooltipEl = container.createDiv("nr-hover-tooltip");
    const splash = container.createDiv("nr-splash");
    const brainSrc = this.app.vault.adapter.getResourcePath(
      `${this.plugin.manifest.dir}/assets/neutralBrain.png`
    );
    splash.createEl("img", { cls: "nr-splash-brain", attr: { src: brainSrc, draggable: "false" } });
    splash.createEl("span", { text: "click to begin", cls: "nr-splash-prompt" });
    splash.addEventListener("click", () => {
      splash.addClass("nr-splash-exit");
      splash.addEventListener("transitionend", () => splash.remove(), { once: true });
      setTimeout(() => main.removeClass("nr-main-hidden"), 100);
    });
    const main = container.createDiv("nr-main nr-main-hidden");
    const header = main.createDiv("nr-header");
    const headerBrainSrc = this.app.vault.adapter.getResourcePath(
      `${this.plugin.manifest.dir}/assets/neutralBrain.png`
    );
    this.headerBrainEl = header.createEl("img", { cls: "nr-header-brain", attr: { src: headerBrainSrc, draggable: "false" } });
    this.brainSpeechEl = header.createDiv("nr-brain-speech");
    const titleRow = header.createDiv("nr-title-row");
    titleRow.createEl("span", { text: "Did You Even Listen", cls: "nr-title" });
    header.createEl("p", { text: "Sometimes to take two steps forward you need to take one step back.", cls: "nr-slogan" });
    const recBar = main.createDiv("nr-rec-bar");
    this.recordBtn = recBar.createEl("button", { cls: "nr-record-btn" });
    this.recordBtn.innerHTML = '<span class="nr-dot"></span> Start Recording';
    this.recordBtn.addEventListener("click", () => this.toggleRecording());
    this.micSelect = recBar.createEl("select", { cls: "nr-mic-select" });
    this.micSelect.title = "Select microphone";
    this.populateMicList();
    navigator.mediaDevices.addEventListener("devicechange", () => this.populateMicList());
    this.timerEl = recBar.createDiv("nr-timer");
    this.timerEl.style.display = "none";
    this.errorEl = main.createDiv("nr-error");
    this.errorEl.style.display = "none";
    const tabBar = main.createDiv("nr-tab-bar");
    const recordTab = tabBar.createEl("button", { text: "Record", cls: "nr-tab nr-tab-active" });
    const reviewTab = tabBar.createEl("button", { text: "Review", cls: "nr-tab" });
    const quizTab = tabBar.createEl("button", { text: "Quiz", cls: "nr-tab" });
    const paneTrack = main.createDiv("nr-pane-track");
    const paneSlider = paneTrack.createDiv("nr-pane-slider");
    const recordPane = paneSlider.createDiv("nr-pane");
    const recordMain = recordPane.createDiv("nr-record-main");
    const editorArea = recordMain.createDiv("nr-editor-area");
    editorArea.createEl("h3", { text: "Your Notes", cls: "nr-panel-title" });
    const editorEl = editorArea.createDiv("nr-cm-editor");
    this.cmEditor = new import_view4.EditorView({
      state: import_state4.EditorState.create({
        doc: "",
        extensions: [
          (0, import_commands.history)(),
          (0, import_view4.drawSelection)(),
          (0, import_language5.indentOnInput)(),
          (0, import_language5.bracketMatching)(),
          import_view4.EditorView.lineWrapping,
          import_view4.keymap.of([...import_commands.defaultKeymap, ...import_commands.historyKeymap]),
          (0, import_view4.placeholder)("Write your own notes here\u2026\n\nCapture ideas in your own words."),
          markdown(),
          (0, import_language5.syntaxHighlighting)(markdownHighlight),
          obsidianEditorTheme,
          highlightField,
          import_view4.EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.updateWordCount();
              this.updateRecheckButtonState();
            }
          })
        ]
      }),
      parent: editorEl
    });
    this.cmEditor.dom.addEventListener("mousedown", (e) => {
      const target = e.target;
      const hl = target.closest('[class*="nr-hl-f"]');
      if (!hl) return;
      const cls = [...hl.classList].find((c) => c.startsWith("nr-hl-f"));
      if (cls) this.openFeedbackPopup(cls.replace("nr-hl-", ""));
    });
    const typeLabel = {
      incomplete: "Expand this",
      missing: "Add this concept",
      incorrect: "Incorrect",
      verbose: "Too verbose \u2014 shorten",
      unclear: "Rewrite clearly"
    };
    this.cmEditor.dom.addEventListener("mouseover", (e) => {
      var _a;
      const target = e.target;
      const hl = target.closest('[class*="nr-hl-f"]');
      if (!hl) {
        this.tooltipEl.style.opacity = "0";
        return;
      }
      const cls = [...hl.classList].find((c) => c.startsWith("nr-hl-f"));
      if (!cls) return;
      const item = this.feedbackItems.find((f) => f.id === cls.replace("nr-hl-", ""));
      if (!item) return;
      this.tooltipEl.empty();
      this.tooltipEl.createEl("span", {
        text: (_a = typeLabel[item.type]) != null ? _a : item.type,
        cls: `nr-tooltip-badge nr-type-${item.type}`
      });
      this.tooltipEl.createEl("p", { text: item.question, cls: "nr-tooltip-question" });
      const rect = hl.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      const tw = this.tooltipEl.offsetWidth;
      const th = this.tooltipEl.offsetHeight;
      let top = rect.top - cRect.top - th - 8;
      let left = rect.left - cRect.left;
      if (top < 0) top = rect.bottom - cRect.top + 8;
      left = Math.min(Math.max(4, left), cRect.width - tw - 4);
      this.tooltipEl.style.top = `${top}px`;
      this.tooltipEl.style.left = `${left}px`;
      this.tooltipEl.style.opacity = "1";
    });
    this.cmEditor.dom.addEventListener("mouseleave", () => {
      this.tooltipEl.style.opacity = "0";
    });
    this.wordCountEl = editorArea.createDiv("nr-wordcount");
    this.wordCountEl.setText("0 words");
    const legend = editorArea.createDiv("nr-legend");
    legend.style.display = "none";
    legend.id = "nr-legend";
    const legendItems = [
      ["expand", "Expand"],
      ["missing", "Add concept"],
      ["incorrect", "Incorrect"],
      ["shorten", "Too verbose"],
      ["unclear", "Rewrite clearly"]
    ];
    for (const [cls, label] of legendItems) {
      const item = legend.createDiv("nr-legend-item");
      item.createEl("span", { cls: `nr-legend-dot nr-legend-${cls}` });
      item.createEl("span", { text: label, cls: "nr-legend-label" });
    }
    this.sidebarEl = recordMain.createDiv("nr-sidebar");
    this.sidebarEl.style.display = "none";
    const sidebarHeader = this.sidebarEl.createDiv("nr-sidebar-header");
    this.sidebarTitleEl = sidebarHeader.createEl("span", { cls: "nr-sidebar-title" });
    const closeBtn = sidebarHeader.createEl("button", { cls: "nr-sidebar-close", attr: { "aria-label": "Close" } });
    closeBtn.setText("\u2715");
    closeBtn.addEventListener("click", () => this.closeSidebar());
    this.sidebarBodyEl = this.sidebarEl.createDiv("nr-sidebar-body");
    const reviewPane = paneSlider.createDiv("nr-pane");
    const reviewPanels = reviewPane.createDiv("nr-panels");
    const transcriptPanel = reviewPanels.createDiv("nr-panel");
    transcriptPanel.createEl("h3", { text: "Transcript", cls: "nr-panel-title" });
    this.transcriptEl = transcriptPanel.createDiv("nr-transcript");
    this.transcriptEl.createEl("p", { text: "Transcript will appear here after recording stops.", cls: "nr-placeholder" });
    this.audioPlaybackEl = transcriptPanel.createDiv("nr-audio-playback");
    this.audioPlaybackEl.style.display = "none";
    const aiPanel = reviewPanels.createDiv("nr-panel");
    aiPanel.createEl("h3", { text: "Lecture Notes", cls: "nr-panel-title" });
    this.aiNotesStatusEl = aiPanel.createDiv("nr-ai-status");
    this.aiNotesEl = aiPanel.createDiv("nr-ai-notes");
    this.aiNotesEl.createEl("p", { text: "AI-generated notes will appear here after recording stops.", cls: "nr-placeholder" });
    const quizPane = paneSlider.createDiv("nr-pane");
    const quizHeader = quizPane.createDiv("nr-quiz-header");
    quizHeader.createEl("h3", { text: "Quiz Yourself", cls: "nr-panel-title" });
    this.newQuestionsBtn = quizHeader.createEl("button", { text: "\u21BB New Questions", cls: "nr-new-questions-btn" });
    this.newQuestionsBtn.style.display = "none";
    this.newQuestionsBtn.addEventListener("click", () => this.generateQuestions());
    this.quizStatusEl = quizPane.createDiv("nr-quiz-status");
    this.quizStatusEl.createEl("p", { text: "Record a lecture first, then come back here to quiz yourself.", cls: "nr-placeholder" });
    this.quizQuestionsEl = quizPane.createDiv("nr-quiz-questions");
    const tabs = [recordTab, reviewTab, quizTab];
    tabs.forEach((tab, i) => tab.addEventListener("click", () => {
      tabs.forEach((t, j) => t.toggleClass("nr-tab-active", j === i));
      paneSlider.style.transform = `translateX(-${i * (100 / 3)}%)`;
      if (i === 2 && this.transcript && this.quizQuestions.length === 0) this.generateQuestions();
    }));
    const footer = main.createDiv("nr-footer");
    this.saveBtn = footer.createEl("button", { text: "Save to Vault", cls: "nr-save-btn" });
    this.saveBtn.disabled = true;
    this.saveBtn.addEventListener("click", () => this.saveToVault());
    this.feedbackBtn = footer.createEl("button", { text: "Get Feedback", cls: "nr-feedback-btn" });
    this.feedbackBtn.disabled = true;
    this.feedbackBtn.addEventListener("click", () => {
      this.showBrainRoast();
      this.runFeedback();
    });
    this.metacogBtn = footer.createEl("button", { text: "\u{1F9E0} Metacognition", cls: "nr-metacog-btn" });
    this.metacogBtn.disabled = true;
    this.metacogBtn.addEventListener("click", () => {
      if (this.mode === "metacognition") this.closeSidebar();
      else this.openMetacognitionMode();
    });
  }
  async onClose() {
    var _a;
    if (this.isRecording) await this.stopRecording();
    (_a = this.cmEditor) == null ? void 0 : _a.destroy();
  }
  // ── Feedback (popup) ──────────────────────────────────────────────────────
  async runFeedback() {
    const studentNotes = this.cmEditor.state.doc.toString().trim();
    if (!studentNotes) {
      this.showError("Write some notes first before getting feedback.");
      return;
    }
    if (!this.generatedMarkdown) {
      this.showError("No AI notes yet \u2014 record a lecture first.");
      return;
    }
    const apiKey = this.plugin.settings.groqApiKey;
    if (!apiKey) {
      this.showError("No Groq API key. Add it in Settings \u2192 Did You Even Listen.");
      return;
    }
    const prevCount = this.feedbackItems.length;
    const isRecheck = this.initialFeedbackItems.length > 0;
    this.feedbackBtn.disabled = true;
    this.feedbackBtn.setText("Analyzing\u2026");
    this.clearHighlights();
    this.metacogSections = [];
    this.metacogGivenUpSections = /* @__PURE__ */ new Set();
    let succeeded = false;
    try {
      if (isRecheck) {
        const unresolvedIds = await filterResolvedFeedback(this.initialFeedbackItems, studentNotes, apiKey);
        const unresolvedSet = new Set(unresolvedIds);
        this.feedbackItems = this.initialFeedbackItems.filter((item) => unresolvedSet.has(item.id)).map((item) => {
          let from = 0, to = 0;
          if (item.studentText) {
            const idx = studentNotes.indexOf(item.studentText);
            if (idx !== -1) {
              from = idx;
              to = idx + item.studentText.length;
            }
          }
          return { ...item, from, to };
        });
      } else {
        const raw = await generateFeedback(studentNotes, this.generatedMarkdown, apiKey);
        this.feedbackItems = raw.map((item, i) => {
          const id = `f${i}`;
          let from = 0, to = 0;
          if (item.studentText) {
            const idx = studentNotes.indexOf(item.studentText);
            if (idx !== -1) {
              from = idx;
              to = idx + item.studentText.length;
            }
          }
          return { ...item, id, from, to };
        });
        this.initialFeedbackItems = [...this.feedbackItems];
      }
      this.prevStudentNotes = studentNotes;
      succeeded = true;
      this.applyHighlights();
      const count2 = this.feedbackItems.filter((f) => f.from < f.to).length;
      if (isRecheck) {
        if (this.feedbackItems.length < prevCount) {
          this.triggerBrainEvent("success", "Nice Change!");
        } else {
          this.triggerBrainEvent("fail", "Better luck next time");
        }
      } else {
        if (count2 >= 5) {
          this.brainScore--;
          this.updateBrainImage();
        } else if (count2 <= 2) {
          this.brainScore++;
          this.updateBrainImage();
        }
      }
      const legend = this.containerEl.querySelector("#nr-legend");
      if (legend) legend.style.display = "flex";
      if (this.mode === "metacognition") {
        this.sidebarBodyEl.empty();
        this.sidebarBodyEl.innerHTML = '<div class="nr-sidebar-loading"><span class="nr-spinner"></span><p>Regrouping sections\u2026</p></div>';
        await this.loadMetacognitionSections(studentNotes, apiKey);
      }
    } catch (e) {
      this.showError(`Feedback failed: ${e.message}`);
    } finally {
      if (succeeded) {
        this.feedbackBtn.disabled = true;
        this.feedbackBtn.setText("Re-check");
      } else {
        this.feedbackBtn.disabled = false;
        this.feedbackBtn.setText(isRecheck ? "Re-check" : "Get Feedback");
      }
    }
  }
  updateRecheckButtonState() {
    if (this.prevStudentNotes === "") return;
    const current = this.cmEditor.state.doc.toString().trim();
    this.feedbackBtn.disabled = !current || current === this.prevStudentNotes;
  }
  openFeedbackPopup(id) {
    const item = this.feedbackItems.find((f) => f.id === id);
    if (!item) return;
    new FeedbackModal(this.app, item, this.plugin.settings.groqApiKey, () => this.triggerBrainEvent("fail")).open();
  }
  applyHighlights() {
    this.highlightTimeouts.forEach((id) => clearTimeout(id));
    this.highlightTimeouts = [];
    this.cmEditor.dispatch({ effects: setHighlights.of([]) });
    const items = this.feedbackItems.filter((item) => item.from < item.to).sort((a, b) => a.from - b.from);
    items.forEach(({ from, to, id, type }, i) => {
      const tid = window.setTimeout(() => {
        this.cmEditor.dispatch({ effects: addHighlight.of({ from, to, id, type }) });
        const coords = this.cmEditor.coordsAtPos(from);
        if (coords) {
          const scrollEl = this.cmEditor.scrollDOM;
          const containerRect = scrollEl.getBoundingClientRect();
          const targetTop = scrollEl.scrollTop + (coords.top - containerRect.top) - scrollEl.clientHeight * 0.4;
          scrollEl.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
        }
      }, i * 700 + 100);
      this.highlightTimeouts.push(tid);
    });
  }
  applyMetacogRevealedHighlights() {
    const revealedIds = /* @__PURE__ */ new Set();
    this.metacogSections.forEach((s, i) => {
      if (this.metacogGivenUpSections.has(i)) s.feedbackIds.forEach((id) => revealedIds.add(id));
    });
    const highlights = this.feedbackItems.filter((item) => revealedIds.has(item.id) && item.from < item.to).map(({ from, to, id, type }) => ({ from, to, id, type }));
    this.cmEditor.dispatch({ effects: setHighlights.of(highlights) });
  }
  clearHighlights() {
    this.highlightTimeouts.forEach((id) => clearTimeout(id));
    this.highlightTimeouts = [];
    this.cmEditor.dispatch({ effects: setHighlights.of([]) });
  }
  // ── Metacognition mode (sidebar) ──────────────────────────────────────────
  async openMetacognitionMode() {
    const studentNotes = this.cmEditor.state.doc.toString().trim();
    if (!studentNotes) {
      this.showError("Write some notes first before doing a metacognition check.");
      return;
    }
    const apiKey = this.plugin.settings.groqApiKey;
    if (!apiKey) {
      this.showError("No Groq API key. Add it in Settings \u2192 Did You Even Listen.");
      return;
    }
    this.mode = "metacognition";
    this.metacogUserScores = [];
    this.metacogGivenUpSections = /* @__PURE__ */ new Set();
    this.metacogBtn.addClass("nr-mode-active");
    this.sidebarTitleEl.setText("\u{1F9E0} Metacognition");
    this.sidebarEl.style.display = "flex";
    this.sidebarBodyEl.empty();
    this.clearHighlights();
    if (this.feedbackItems.length === 0) {
      this.sidebarBodyEl.innerHTML = '<div class="nr-sidebar-loading"><span class="nr-spinner"></span><p>Running feedback analysis\u2026</p></div>';
      try {
        const raw = await generateFeedback(studentNotes, this.generatedMarkdown, apiKey);
        this.feedbackItems = raw.map((item, i) => {
          const id = `f${i}`;
          let from = 0, to = 0;
          if (item.studentText) {
            const idx = studentNotes.indexOf(item.studentText);
            if (idx !== -1) {
              from = idx;
              to = idx + item.studentText.length;
            }
          }
          return { ...item, id, from, to };
        });
        this.initialFeedbackItems = [...this.feedbackItems];
        this.prevStudentNotes = studentNotes;
      } catch (e) {
        this.sidebarBodyEl.empty();
        this.sidebarBodyEl.createEl("p", { text: `Analysis failed: ${e.message}`, cls: "nr-sidebar-error" });
        return;
      }
    }
    await this.loadMetacognitionSections(studentNotes, apiKey);
  }
  async loadMetacognitionSections(studentNotes, apiKey) {
    if (this.metacogSections.length === 0) {
      this.sidebarBodyEl.empty();
      this.sidebarBodyEl.innerHTML = '<div class="nr-sidebar-loading"><span class="nr-spinner"></span><p>Identifying knowledge sections\u2026</p></div>';
      try {
        this.metacogSections = await groupFeedbackIntoSections(
          this.feedbackItems,
          studentNotes,
          this.generatedMarkdown,
          apiKey
        );
      } catch (e) {
        this.sidebarBodyEl.empty();
        this.sidebarBodyEl.createEl("p", { text: `Section analysis failed: ${e.message}`, cls: "nr-sidebar-error" });
        return;
      }
    }
    this.metacogUserScores = new Array(this.metacogSections.length).fill(0);
    this.renderMetacognitionRating();
  }
  renderMetacognitionRating() {
    this.sidebarBodyEl.empty();
    this.sidebarBodyEl.createEl("p", {
      text: "Rate how well YOU covered each topic, then compare with the AI.",
      cls: "nr-sidebar-intro"
    });
    const covered = this.metacogSections.map((s, i) => ({ s, i })).filter(({ s }) => !!s.studentExcerpt);
    const missed = this.metacogSections.map((s, i) => ({ s, i })).filter(({ s }) => !s.studentExcerpt);
    missed.forEach(({ i }) => {
      this.metacogUserScores[i] = 1;
    });
    covered.forEach(({ s: section, i }) => {
      const card = this.sidebarBodyEl.createDiv("nr-metacog-card");
      card.createEl("h4", { text: section.title, cls: "nr-metacog-section-title" });
      card.createEl("p", { text: `"${section.studentExcerpt}"`, cls: "nr-metacog-excerpt" });
      card.createEl("p", { text: "Your rating:", cls: "nr-metacog-rating-label" });
      const row = card.createDiv("nr-metacog-rating-row");
      for (let n = 1; n <= 10; n++) {
        const btn = row.createEl("button", { text: String(n), cls: "nr-rating-btn" });
        btn.addEventListener("click", () => {
          this.metacogUserScores[i] = n;
          row.querySelectorAll(".nr-rating-btn").forEach((b, bi) => b.toggleClass("nr-rating-selected", bi < n));
          compareBtn.disabled = covered.some(({ i: ci }) => this.metacogUserScores[ci] === 0);
        });
      }
    });
    if (missed.length > 0) {
      const missedBox = this.sidebarBodyEl.createDiv("nr-metacog-missed-box");
      missedBox.createEl("p", { text: "Topics you didn't cover \u2014 add these to your notes:", cls: "nr-metacog-missed-label" });
      const list = missedBox.createEl("ul", { cls: "nr-metacog-missed-list" });
      missed.forEach(({ s }) => list.createEl("li", { text: s.title }));
    }
    const compareBtn = this.sidebarBodyEl.createEl("button", {
      text: "Compare with AI \u2192",
      cls: "nr-metacog-compare-btn"
    });
    compareBtn.disabled = covered.some(({ i }) => this.metacogUserScores[i] === 0);
    compareBtn.addEventListener("click", () => this.runMetacognitionComparison(compareBtn));
  }
  async runMetacognitionComparison(compareBtn) {
    compareBtn.disabled = true;
    compareBtn.setText("Analyzing\u2026");
    const apiKey = this.plugin.settings.groqApiKey;
    const coveredIndices = this.metacogSections.map((s, i) => ({ s, i })).filter(({ s }) => !!s.studentExcerpt);
    const coveredSections = coveredIndices.map(({ s }) => s);
    const coveredScores = coveredIndices.map(({ i }) => this.metacogUserScores[i]);
    let feedback;
    try {
      feedback = await generateComparisonFeedback(coveredSections, this.feedbackItems, coveredScores, apiKey);
    } catch (e) {
      feedback = coveredSections.map(() => "Could not generate feedback.");
    }
    const overconfident = coveredSections.filter((s, i) => coveredScores[i] - s.aiScore > 2).length;
    const total = coveredSections.length;
    if (overconfident > total / 2) {
      this.brainScore--;
      this.updateBrainImage();
    } else if (overconfident === 0 && total > 0) {
      this.brainScore++;
      this.updateBrainImage();
    }
    this.renderMetacognitionResults(coveredSections, coveredScores, feedback);
  }
  renderMetacognitionResults(sections, userScores, feedback) {
    this.sidebarBodyEl.empty();
    const topRow = this.sidebarBodyEl.createDiv("nr-sidebar-summary");
    topRow.createEl("span", { text: "Self-assessment vs AI", cls: "nr-sidebar-count" });
    const recheckBtn = topRow.createEl("button", { text: "\u21BB Recheck", cls: "nr-sidebar-recheck-btn" });
    recheckBtn.addEventListener("click", () => this.recheckAll());
    const byId = new Map(this.feedbackItems.map((f) => [f.id, f]));
    sections.forEach((section, i) => {
      var _a;
      const userScore = userScores[i];
      const aiScore = section.aiScore;
      const gap = userScore - aiScore;
      const gapClass = gap > 2 ? "nr-gap-over" : gap < -2 ? "nr-gap-under" : "nr-gap-ok";
      const card = this.sidebarBodyEl.createDiv("nr-metacog-card nr-metacog-result");
      card.createEl("h4", { text: section.title, cls: "nr-metacog-section-title" });
      const scores = card.createDiv("nr-metacog-scores");
      scores.createEl("span", { text: `You: ${userScore}/10`, cls: "nr-score-user" });
      scores.createEl("span", { text: "\xB7", cls: "nr-score-sep" });
      scores.createEl("span", { text: `AI: ${aiScore}/10`, cls: `nr-score-ai ${gapClass}` });
      card.createEl("p", { text: (_a = feedback[i]) != null ? _a : "", cls: "nr-metacog-feedback" });
      if (section.feedbackIds.length > 0) {
        const issuesWrap = card.createDiv("nr-metacog-issues-wrap");
        issuesWrap.style.display = "none";
        const giveUpBtn = card.createEl("button", {
          text: "Give up \u2014 show issues",
          cls: "nr-giveup-btn"
        });
        giveUpBtn.addEventListener("click", () => {
          this.metacogGivenUpSections.add(this.metacogSections.indexOf(section));
          giveUpBtn.style.display = "none";
          issuesWrap.style.display = "block";
          this.applyMetacogRevealedHighlights();
          this.triggerBrainEvent("fail");
          const typeLabel = {
            incomplete: "Expand this",
            missing: "Add this concept",
            incorrect: "Incorrect",
            verbose: "Too verbose",
            unclear: "Rewrite clearly"
          };
          section.feedbackIds.forEach((id) => {
            var _a2;
            const item = byId.get(id);
            if (!item) return;
            const row = issuesWrap.createDiv("nr-metacog-issue-row");
            row.createEl("span", {
              text: (_a2 = typeLabel[item.type]) != null ? _a2 : item.type,
              cls: `nr-type-badge nr-type-${item.type}`
            });
            if (item.studentText) {
              row.createEl("span", {
                text: ` "${item.studentText.slice(0, 60)}${item.studentText.length > 60 ? "\u2026" : ""}"`,
                cls: "nr-metacog-issue-quote"
              });
            }
          });
        });
      }
    });
  }
  setBrainAsset(asset, resetAfter = false) {
    if (this.brainResetTimeout !== null) clearTimeout(this.brainResetTimeout);
    this.headerBrainEl.style.opacity = "0";
    window.setTimeout(() => {
      this.headerBrainEl.src = this.app.vault.adapter.getResourcePath(
        `${this.plugin.manifest.dir}/assets/${asset}`
      );
      this.headerBrainEl.style.opacity = "1";
    }, 400);
    if (resetAfter) {
      this.brainResetTimeout = window.setTimeout(() => {
        this.headerBrainEl.style.opacity = "0";
        window.setTimeout(() => {
          this.headerBrainEl.src = this.app.vault.adapter.getResourcePath(
            `${this.plugin.manifest.dir}/assets/neutralBrain.png`
          );
          this.headerBrainEl.style.opacity = "1";
          this.brainResetTimeout = null;
        }, 400);
      }, 5e3);
    }
  }
  updateBrainImage() {
    const asset = this.brainScore <= -2 ? "roastedBrain.png" : this.brainScore >= 2 ? "galaxyBrain.png" : "neutralBrain.png";
    this.setBrainAsset(asset, asset !== "neutralBrain.png");
  }
  triggerBrainEvent(type, message) {
    const asset = type === "fail" ? "roastedBrain.png" : "galaxyBrain.png";
    this.setBrainAsset(asset, true);
    const container = this.containerEl.children[1];
    const overlay = container.createDiv(`nr-result-overlay nr-result-${type}`);
    const brainSrc = this.app.vault.adapter.getResourcePath(
      `${this.plugin.manifest.dir}/assets/${asset}`
    );
    overlay.createEl("img", { cls: "nr-result-brain", attr: { src: brainSrc, draggable: "false" } });
    overlay.createEl("p", {
      text: message != null ? message : type === "fail" ? "Better luck next time" : "YOU SUCCEEDED!",
      cls: "nr-result-title"
    });
    overlay.createEl("p", { text: "click to continue", cls: "nr-result-sub" });
    requestAnimationFrame(() => overlay.addClass("nr-result-visible"));
    const dismiss = () => {
      overlay.removeClass("nr-result-visible");
      overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    };
    overlay.addEventListener("click", dismiss);
    setTimeout(dismiss, 4e3);
  }
  async recheckAll() {
    const studentNotes = this.cmEditor.state.doc.toString().trim();
    const apiKey = this.plugin.settings.groqApiKey;
    if (!studentNotes || !apiKey) return;
    const prevCount = this.feedbackItems.length;
    this.metacogSections = [];
    this.metacogGivenUpSections = /* @__PURE__ */ new Set();
    this.brainScore = 0;
    this.updateBrainImage();
    this.clearHighlights();
    this.sidebarBodyEl.empty();
    this.sidebarBodyEl.innerHTML = '<div class="nr-sidebar-loading"><span class="nr-spinner"></span><p>Running feedback analysis\u2026</p></div>';
    try {
      if (this.initialFeedbackItems.length > 0) {
        const unresolvedIds = await filterResolvedFeedback(this.initialFeedbackItems, studentNotes, apiKey);
        const unresolvedSet = new Set(unresolvedIds);
        this.feedbackItems = this.initialFeedbackItems.filter((item) => unresolvedSet.has(item.id)).map((item) => {
          let from = 0, to = 0;
          if (item.studentText) {
            const idx = studentNotes.indexOf(item.studentText);
            if (idx !== -1) {
              from = idx;
              to = idx + item.studentText.length;
            }
          }
          return { ...item, from, to };
        });
      } else {
        const raw = await generateFeedback(studentNotes, this.generatedMarkdown, apiKey);
        this.feedbackItems = raw.map((item, i) => {
          const id = `f${i}`;
          let from = 0, to = 0;
          if (item.studentText) {
            const idx = studentNotes.indexOf(item.studentText);
            if (idx !== -1) {
              from = idx;
              to = idx + item.studentText.length;
            }
          }
          return { ...item, id, from, to };
        });
        this.initialFeedbackItems = [...this.feedbackItems];
      }
      this.prevStudentNotes = studentNotes;
    } catch (e) {
      this.sidebarBodyEl.createEl("p", { text: `Recheck failed: ${e.message}`, cls: "nr-sidebar-error" });
      return;
    }
    await this.loadMetacognitionSections(studentNotes, apiKey);
    const newCount = this.feedbackItems.length;
    if (newCount < prevCount) {
      this.triggerBrainEvent("success", "Nice Change!");
    } else {
      this.triggerBrainEvent("fail", "Better luck next time");
    }
  }
  closeSidebar() {
    this.mode = "normal";
    this.sidebarEl.style.display = "none";
    this.metacogBtn.removeClass("nr-mode-active");
    if (this.feedbackItems.length > 0) this.applyHighlights();
  }
  // ── Recording ─────────────────────────────────────────────────────────────
  async toggleRecording() {
    this.isRecording ? await this.stopRecording() : await this.startRecording();
  }
  async populateMicList() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === "audioinput");
      const prev = this.micSelect.value;
      this.micSelect.empty();
      if (mics.length === 0) {
        this.micSelect.createEl("option", { text: "No microphones found", value: "" });
        return;
      }
      for (const mic of mics) {
        const label = mic.label || `Microphone ${this.micSelect.options.length + 1}`;
        this.micSelect.createEl("option", { text: label, value: mic.deviceId });
      }
      if (prev && [...this.micSelect.options].some((o) => o.value === prev)) this.micSelect.value = prev;
    } catch (e) {
    }
  }
  async startRecording() {
    try {
      const deviceId = this.micSelect.value;
      const audioConstraints = deviceId ? { deviceId: { exact: deviceId } } : true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      this.populateMicList();
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.transcript = "";
      this.generatedMarkdown = "";
      this.seconds = 0;
      this.errorEl.style.display = "none";
      this.savedVaultPath = null;
      this.audioPlaybackEl.style.display = "none";
      this.transcriptEl.empty();
      this.transcriptEl.createEl("p", { text: "Recording\u2026 transcript will appear when done.", cls: "nr-placeholder" });
      this.aiNotesEl.empty();
      this.aiNotesEl.createEl("p", { text: "AI-generated notes will appear here after recording stops.", cls: "nr-placeholder" });
      this.aiNotesStatusEl.empty();
      this.saveBtn.disabled = true;
      this.feedbackBtn.disabled = true;
      this.feedbackBtn.setText("Get Feedback");
      this.metacogBtn.disabled = true;
      this.clearHighlights();
      this.closeSidebar();
      this.feedbackItems = [];
      this.initialFeedbackItems = [];
      this.prevStudentNotes = "";
      this.metacogSections = [];
      this.metacogGivenUpSections = /* @__PURE__ */ new Set();
      this.quizQuestions = [];
      this.quizQuestionsEl.empty();
      this.newQuestionsBtn.style.display = "none";
      this.quizStatusEl.empty();
      this.quizStatusEl.createEl("p", { text: "Record a lecture first, then come back here to quiz yourself.", cls: "nr-placeholder" });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordBtn.addClass("nr-recording");
      this.containerEl.children[1].addClass("nr-is-recording");
      this.recordBtn.innerHTML = '<span class="nr-dot"></span> Stop Recording';
      this.timerEl.style.display = "flex";
      this.timerInterval = window.setInterval(() => {
        this.seconds++;
        this.timerEl.setText(this.formatTime(this.seconds));
      }, 1e3);
    } catch (e) {
      this.showError("Microphone access denied.");
    }
  }
  async stopRecording() {
    this.isRecording = false;
    this.containerEl.children[1].removeClass("nr-is-recording");
    if (this.mediaRecorder) {
      this.mediaRecorder.onstop = () => this.processRecording();
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    }
    if (this.timerInterval !== null) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.recordBtn.removeClass("nr-recording");
    this.recordBtn.innerHTML = '<span class="nr-dot"></span> Start Recording';
    this.timerEl.style.display = "none";
  }
  async processRecording() {
    const blob = new Blob(this.audioChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    this.audioPlaybackEl.empty();
    this.audioPlaybackEl.createEl("p", { text: "Temp Playback", cls: "nr-playback-label" });
    const audio = this.audioPlaybackEl.createEl("audio");
    audio.src = url;
    audio.controls = true;
    this.audioPlaybackEl.style.display = "block";
    if (TEST_MODE) {
      this.transcript = SAMPLE_TRANSCRIPT;
      this.generatedMarkdown = SAMPLE_AI_NOTES;
      this.transcriptEl.setText(this.transcript);
      await import_obsidian.MarkdownRenderer.render(this.app, this.generatedMarkdown, this.aiNotesEl, "", this);
      this.saveBtn.disabled = false;
      this.feedbackBtn.disabled = false;
      this.metacogBtn.disabled = false;
      return;
    }
    const apiKey = this.plugin.settings.groqApiKey;
    if (!apiKey) {
      this.showError("No Groq API key. Add it in Settings \u2192 Did You Even Listen.");
      return;
    }
    this.aiNotesStatusEl.setText("Transcribing\u2026");
    this.transcriptEl.empty();
    try {
      this.transcript = await transcribeAudio(blob, apiKey);
      this.transcriptEl.setText(this.transcript);
    } catch (e) {
      this.showError(`Transcription failed: ${e.message}`);
      this.aiNotesStatusEl.empty();
      return;
    }
    this.aiNotesStatusEl.innerHTML = '<span class="nr-spinner"></span> Generating notes\u2026';
    this.aiNotesEl.empty();
    try {
      this.generatedMarkdown = await generateNotes(this.transcript, apiKey);
      this.aiNotesStatusEl.empty();
      await import_obsidian.MarkdownRenderer.render(this.app, this.generatedMarkdown, this.aiNotesEl, "", this);
      this.saveBtn.disabled = false;
      this.feedbackBtn.disabled = false;
      this.metacogBtn.disabled = false;
    } catch (e) {
      this.showError(`Note generation failed: ${e.message}`);
      this.aiNotesStatusEl.empty();
    }
  }
  // ── Quiz ──────────────────────────────────────────────────────────────────
  async generateQuestions() {
    const apiKey = this.plugin.settings.groqApiKey;
    if (!apiKey) {
      this.showError("No Groq API key.");
      return;
    }
    this.quizQuestionsEl.empty();
    this.quizStatusEl.empty();
    this.quizStatusEl.innerHTML = '<span class="nr-spinner"></span> Generating questions\u2026';
    this.newQuestionsBtn.disabled = true;
    this.newQuestionsBtn.style.display = "";
    try {
      this.quizQuestions = await generateQuizQuestions(this.transcript, this.generatedMarkdown, apiKey);
      this.quizStatusEl.empty();
      this.renderQuizQuestions();
    } catch (e) {
      this.quizStatusEl.empty();
      this.showError(`Quiz generation failed: ${e.message}`);
    } finally {
      this.newQuestionsBtn.disabled = false;
    }
  }
  renderQuizQuestions() {
    this.quizQuestionsEl.empty();
    const sections = [
      { type: "explain", icon: "\u{1F9D2}", label: "Explain Simply" },
      { type: "whatif", icon: "\u{1F914}", label: "What If?" },
      { type: "quiz", icon: "\u270F\uFE0F", label: "Quiz" }
    ];
    for (const { type, icon, label } of sections) {
      const qs = this.quizQuestions.filter((q) => q.type === type);
      if (!qs.length) continue;
      const section = this.quizQuestionsEl.createDiv("nr-quiz-section");
      section.createEl("h4", { text: `${icon}  ${label}`, cls: "nr-quiz-section-title" });
      for (const q of qs) this.renderQuestionCard(section, q);
    }
  }
  renderQuestionCard(parent, q) {
    const card = parent.createDiv("nr-quiz-card");
    card.createEl("p", { text: q.question, cls: "nr-quiz-question" });
    const textarea = card.createEl("textarea", {
      cls: "nr-quiz-answer",
      attr: { placeholder: "Write your answer here\u2026" }
    });
    const actions = card.createDiv("nr-quiz-actions");
    const checkBtn = actions.createEl("button", { text: "Check Answer", cls: "nr-quiz-check-btn" });
    const revealBtn = actions.createEl("button", { text: "Show Sample Answer", cls: "nr-quiz-reveal-btn" });
    const sampleEl = card.createDiv("nr-quiz-sample");
    sampleEl.createEl("p", { text: "Sample Answer", cls: "nr-quiz-sample-label" });
    sampleEl.createEl("p", { text: q.sampleAnswer, cls: "nr-quiz-sample-text" });
    sampleEl.style.display = "none";
    const feedbackEl = card.createDiv("nr-quiz-feedback");
    feedbackEl.style.display = "none";
    checkBtn.addEventListener("click", async () => {
      if (!textarea.value.trim()) return;
      checkBtn.disabled = true;
      checkBtn.setText("Checking\u2026");
      feedbackEl.style.display = "none";
      try {
        const result = await evaluateAnswer(q, textarea.value.trim(), this.transcript, this.plugin.settings.groqApiKey);
        const labels = { good: "\u2713  Good", partial: "\u25D0  Partial", "needs-work": "\u2717  Needs work" };
        feedbackEl.empty();
        feedbackEl.setAttribute("class", `nr-quiz-feedback nr-quiz-fb-${result.score}`);
        feedbackEl.createEl("strong", { text: labels[result.score] + "  " });
        feedbackEl.createEl("span", { text: result.feedback });
        feedbackEl.style.display = "block";
      } catch (e) {
        this.showError(`Evaluation failed: ${e.message}`);
      } finally {
        checkBtn.disabled = false;
        checkBtn.setText("Check Answer");
      }
    });
    revealBtn.addEventListener("click", () => {
      const shown = sampleEl.style.display !== "none";
      sampleEl.style.display = shown ? "none" : "block";
      revealBtn.setText(shown ? "Show Sample Answer" : "Hide Sample Answer");
    });
  }
  // ── Save ──────────────────────────────────────────────────────────────────
  async saveToVault() {
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().slice(0, 5).replace(":", "-");
    const folder = this.plugin.settings.saveFolder.trim().replace(/\/$/, "");
    if (!this.savedVaultPath) {
      const baseName = `Lecture Notes ${dateStr} ${timeStr}`;
      this.savedVaultPath = folder ? `${folder}/${baseName}.md` : `${baseName}.md`;
    }
    const content = [
      `*Recorded: ${now.toLocaleString()}*`,
      "",
      "## My Notes",
      "",
      this.cmEditor.state.doc.toString().trim() || "*No notes written.*",
      "",
      "---",
      "",
      "## Transcript",
      "",
      this.transcript.trim() || "*No transcript available.*"
    ].join("\n");
    try {
      if (folder && !await this.app.vault.adapter.exists(folder)) await this.app.vault.createFolder(folder);
      const exists = await this.app.vault.adapter.exists(this.savedVaultPath);
      if (exists) {
        const file = this.app.vault.getAbstractFileByPath(this.savedVaultPath);
        if (file && "extension" in file) {
          await this.app.vault.modify(file, content);
          new import_obsidian.Notice(`Updated: ${this.savedVaultPath}`);
        }
      } else {
        await this.app.vault.create(this.savedVaultPath, content);
        new import_obsidian.Notice(`Saved: ${this.savedVaultPath}`);
      }
      this.saveBtn.setText("Update in Vault");
    } catch (e) {
      new import_obsidian.Notice(`Failed to save: ${e.message}`);
    }
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  updateWordCount() {
    const text = this.cmEditor.state.doc.toString().trim();
    const count2 = text === "" ? 0 : text.split(/\s+/).length;
    this.wordCountEl.setText(`${count2} ${count2 === 1 ? "word" : "words"}`);
  }
  showError(msg) {
    if (this.errorTimeout !== null) clearTimeout(this.errorTimeout);
    this.errorEl.setText(`\u26A0 ${msg}`);
    this.errorEl.style.display = "block";
    this.errorEl.style.opacity = "1";
    this.errorTimeout = window.setTimeout(() => {
      this.errorEl.style.opacity = "0";
      this.errorTimeout = window.setTimeout(() => {
        this.errorEl.style.display = "none";
        this.errorEl.style.opacity = "1";
      }, 600);
    }, 5e3);
  }
  showBrainRoast() {
    const roasts = [
      "Did you even listen?",
      "I've seen better notes on a napkin.",
      "Were you asleep? I was here the whole time.",
      "Bold strategy, barely paying attention.",
      "Not bad. Actually, yes. Very bad.",
      "You had one job.",
      "My context window outlasted your focus.",
      "This is... a choice.",
      "I've processed 175B parameters for this?",
      "Spellcheck called. It's giving up.",
      "Even the transcript is embarrassed.",
      "Fascinating. Wrong, but fascinating."
    ];
    const line = roasts[Math.floor(Math.random() * roasts.length)];
    if (this.brainSpeechTimeout !== null) clearTimeout(this.brainSpeechTimeout);
    this.brainSpeechEl.setText(line);
    this.brainSpeechEl.style.opacity = "1";
    this.brainSpeechTimeout = window.setTimeout(() => {
      this.brainSpeechEl.style.opacity = "0";
      this.brainSpeechTimeout = null;
    }, 4e3);
  }
  formatTime(s) {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  groqApiKey: "",
  saveFolder: ""
};
var DidYouEvenListenPlugin = class extends import_obsidian2.Plugin {
  async onload() {
    await this.loadSettings();
    this.registerView(
      RECORDER_VIEW_TYPE,
      (leaf) => new RecorderView(leaf, this)
    );
    this.addRibbonIcon("mic", "Did You Even Listen", () => this.activateView());
    this.addCommand({
      id: "open-didyouevenlisten",
      name: "Open Did You Even Listen recorder",
      callback: () => this.activateView()
    });
    this.addSettingTab(new DidYouEvenListenSettingTab(this.app, this));
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(RECORDER_VIEW_TYPE);
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(RECORDER_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: RECORDER_VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var DidYouEvenListenSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("Groq API key").setDesc("Free API key from console.groq.com").addText(
      (text) => text.setPlaceholder("AIza...").setValue(this.plugin.settings.groqApiKey).onChange(async (value) => {
        this.plugin.settings.groqApiKey = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Save folder").setDesc("Vault folder to save notes into (leave blank for root)").addText(
      (text) => text.setPlaceholder("Lectures/").setValue(this.plugin.settings.saveFolder).onChange(async (value) => {
        this.plugin.settings.saveFolder = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
