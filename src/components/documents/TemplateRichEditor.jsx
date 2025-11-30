import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Heading1, Heading2, Heading3, Type,
  ChevronDown, Variable, Table, Minus,
  Undo, Redo, FileSignature, Flag, Highlighter, Info
} from "lucide-react";

const COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Gray", value: "#666666" },
  { label: "Red", value: "#dc2626" },
  { label: "Green", value: "#1EB053" },
  { label: "Blue", value: "#0072C6" },
  { label: "Navy", value: "#0F1F3C" },
  { label: "Orange", value: "#ea580c" },
  { label: "Purple", value: "#7c3aed" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Orange", value: "#fed7aa" },
];

export default function TemplateRichEditor({ content, onChange, variables = [] }) {
  const editorRef = useRef(null);
  const [showVariableMenu, setShowVariableMenu] = useState(false);

  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  }, []);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertVariable = (variable) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'template-variable';
      span.contentEditable = 'false';
      span.innerHTML = `{{${variable.key}}}`;
      span.style.cssText = 'background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; cursor: default;';
      range.deleteContents();
      range.insertNode(span);
      range.setStartAfter(span);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    handleContentChange();
    setShowVariableMenu(false);
  };

  const insertSignatureBlock = () => {
    const html = `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <div>
            <p style="margin-bottom: 8px; font-weight: 600;">Employee Signature:</p>
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 8px;"></div>
            <p style="margin: 0;">{{employee_name}}</p>
            <p style="margin: 4px 0; color: #666;">Date: {{signature_date}}</p>
          </div>
          <div>
            <p style="margin-bottom: 8px; font-weight: 600;">Company Representative:</p>
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 8px;"></div>
            <p style="margin: 0;">{{company_signatory}}</p>
            <p style="margin: 4px 0; color: #666;">Date: {{signature_date}}</p>
          </div>
        </div>
      </div>
    `;
    execCommand('insertHTML', html);
  };

  const insertHeader = () => {
    const html = `
      <div style="text-align: center; padding: 20px; border-bottom: 4px solid; border-image: linear-gradient(to right, #1EB053, #FFFFFF, #0072C6) 1; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px; color: #0F1F3C;">{{company_name}}</h1>
        <p style="margin: 8px 0 0 0; color: #666;">Document Title</p>
      </div>
    `;
    execCommand('insertHTML', html);
  };

  const insertTable = (rows, cols) => {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';
    for (let i = 0; i < rows; i++) {
      tableHtml += '<tr>';
      for (let j = 0; j < cols; j++) {
        const style = i === 0 
          ? 'style="border: 1px solid #e5e7eb; padding: 8px; background: #f9fafb; font-weight: 600;"'
          : 'style="border: 1px solid #e5e7eb; padding: 8px;"';
        tableHtml += `<td ${style}>${i === 0 ? 'Header' : 'Cell'}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    execCommand('insertHTML', tableHtml);
  };

  const insertInfoBox = () => {
    const html = `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #0072C6; padding: 16px; border-radius: 4px; margin: 16px 0;">
        <p style="margin: 0; font-weight: 600; color: #0F1F3C;">Important Notice</p>
        <p style="margin: 8px 0 0 0; color: #1e40af;">Add your important information here.</p>
      </div>
    `;
    execCommand('insertHTML', html);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b px-2 py-1.5 flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <div className="flex items-center border-r pr-2 mr-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('undo')}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('redo')}>
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Type className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => execCommand('formatBlock', 'p')}>
              <Type className="w-4 h-4 mr-2" /> Normal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execCommand('formatBlock', 'h1')}>
              <Heading1 className="w-4 h-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execCommand('formatBlock', 'h2')}>
              <Heading2 className="w-4 h-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execCommand('formatBlock', 'h3')}>
              <Heading3 className="w-4 h-4 mr-2" /> Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('bold')}>
          <Bold className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('italic')}>
          <Italic className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('underline')}>
          <Underline className="w-4 h-4" />
        </Button>

        {/* Text Color */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <div className="flex flex-col items-center">
                <Type className="w-3 h-3" />
                <div className="w-4 h-1 bg-black rounded-full mt-0.5" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="grid grid-cols-4 gap-1 p-2">
              {COLORS.map(color => (
                <button
                  key={color.value}
                  className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  onClick={() => execCommand('foreColor', color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Highlight */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Highlighter className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="grid grid-cols-5 gap-1 p-2">
              {HIGHLIGHT_COLORS.map(color => (
                <button
                  key={color.value}
                  className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  onClick={() => execCommand('hiliteColor', color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyLeft')}>
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyCenter')}>
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyRight')}>
          <AlignRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertUnorderedList')}>
          <List className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertOrderedList')}>
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Insert Elements */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Table className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => insertTable(2, 2)}>2 × 2 Table</DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTable(3, 3)}>3 × 3 Table</DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTable(4, 4)}>4 × 4 Table</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={insertInfoBox} title="Info Box">
          <Info className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertHorizontalRule')} title="Divider">
          <Minus className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Document Blocks */}
        <Button variant="outline" size="sm" className="h-8 gap-1 text-[#0072C6]" onClick={insertHeader}>
          <Flag className="w-3 h-3" /> Header
        </Button>

        <Button variant="outline" size="sm" className="h-8 gap-1 text-[#1EB053]" onClick={insertSignatureBlock}>
          <FileSignature className="w-3 h-3" /> Signatures
        </Button>

        {/* Variables */}
        <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
          <PopoverTrigger asChild>
            <Button variant="default" size="sm" className="h-8 gap-1 bg-[#1EB053] hover:bg-[#178f43] ml-auto">
              <Variable className="w-3 h-3" /> Insert Variable
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <p className="text-xs font-medium text-gray-500 mb-2">Click to insert</p>
            {variables.length > 0 ? (
              <div className="space-y-1">
                {variables.map((v, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center justify-between"
                    onClick={() => insertVariable(v)}
                  >
                    <span>{v.label}</span>
                    <code className="text-[10px] bg-gray-100 px-1 rounded">{`{{${v.key}}}`}</code>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-2">No variables defined. Add them in the Variables tab.</p>
            )}
            <div className="border-t mt-2 pt-2">
              <p className="text-xs text-gray-500 mb-1">System Variables</p>
              <div className="space-y-1">
                {[
                  { key: 'signature_date', label: 'Signature Date' },
                  { key: 'digital_signature', label: 'Digital Signature' },
                ].map((v, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center justify-between"
                    onClick={() => insertVariable(v)}
                  >
                    <span>{v.label}</span>
                    <code className="text-[10px] bg-gray-100 px-1 rounded">{`{{${v.key}}}`}</code>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Area - Google Docs style */}
      <ScrollArea className="flex-1 bg-[#f8f9fa]">
        <div className="py-8 px-4 flex justify-center">
          <div 
            className="bg-white shadow-md rounded-sm min-h-[700px] w-full max-w-[816px]"
            style={{ padding: '72px 72px' }}
          >
            <div
              ref={editorRef}
              className="min-h-[600px] outline-none"
              contentEditable
              onInput={handleContentChange}
              onBlur={handleContentChange}
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '11pt',
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>
      </ScrollArea>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t px-3 py-1.5 flex items-center justify-between text-xs text-gray-500">
        <span>Document Editor</span>
        <span>{variables.length} variable(s) available</span>
      </div>
    </div>
  );
}