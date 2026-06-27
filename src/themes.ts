/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CSSTheme } from './types';

export const BUILTIN_THEMES: CSSTheme[] = [
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    description: 'Sophisticated deep-slate palette inspired by the classic Noctis Luxury design.',
    isDark: true,
    cssRules: `/* Elegant Dark CSS Theme */
.markdown-body {
  color: #E4E4E7;
  background-color: #111113;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji";
  line-height: 1.7;
  padding: 2.5rem;
  font-size: 16px;
}
.markdown-body h1 { font-size: 2.25em; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 700; color: #ffffff; }
.markdown-body h2 { font-size: 1.625em; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: rgba(255,255,255,0.9); }
.markdown-body h3 { font-size: 1.25em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: rgba(255,255,255,0.85); }
.markdown-body h4 { font-size: 1em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: rgba(255,255,255,0.8); }
.markdown-body h5 { font-size: 0.875em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; }
.markdown-body p { margin-top: 0; margin-bottom: 1.2rem; color: rgba(255,255,255,0.7); text-align: justify; }
.markdown-body a { color: #818cf8; text-decoration: none; font-weight: 500; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body blockquote { padding: 0 1em; color: rgba(255,255,255,0.5); border-left: 0.25em solid rgba(129,140,248,0.5); margin: 1.5em 0; background: rgba(255,255,255,0.03); border-radius: 4px; padding-top: 8px; padding-bottom: 8px; }
.markdown-body ul, .markdown-body ol { padding-left: 2em; margin-top: 0; margin-bottom: 1rem; }
.markdown-body ul { list-style-type: disc; }
.markdown-body ol { list-style-type: decimal; }
.markdown-body li { margin-top: 0.35em; margin-bottom: 0.35em; color: rgba(255,255,255,0.7); }
.markdown-body code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(255,255,255,0.08); border-radius: 6px; color: #E4E4E7; font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #0A0A0B; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-top: 1.5em; margin-bottom: 1.5em; }
.markdown-body pre code { background-color: transparent; padding: 0; margin: 0; font-size: 100%; border-radius: 0; }
.markdown-body table { border-spacing: 0; border-collapse: collapse; width: 100%; margin-top: 1.5em; margin-bottom: 1.5em; }
.markdown-body td, .markdown-body th { padding: 8px 13px; border: 1px solid rgba(255,255,255,0.08); }
.markdown-body th { font-weight: 600; background-color: rgba(255,255,255,0.04); }
.markdown-body tr { background-color: #111113; }
.markdown-body tr:nth-child(2n) { background-color: rgba(255,255,255,0.02); }
.markdown-body hr { height: 1px; padding: 0; margin: 24px 0; background-color: rgba(255,255,255,0.1); border: 0; }
.markdown-body img { max-width: 100%; box-sizing: content-box; background-color: #111113; }

/* Code Syntax Highlighting colors */
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: rgba(255,255,255,0.35); font-style: italic; }
.token.punctuation { color: #a1a1aa; }
.token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #ff9e64; }
.token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #9ece6a; }
.token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #E4E4E7; }
.token.atrule, .token.attr-value, .token.keyword { color: #bb9af7; }
.token.function, .token.class-name { color: #7aa2f7; }
.token.regex, .token.important, .token.variable { color: #f7768e; }
:root { --color-accent: #818cf8; }`
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    description: 'Clean, modern classic light theme based on GitHub desktop reader.',
    isDark: false,
    cssRules: `/* GitHub Light CSS Theme */
.markdown-body {
  color: #24292f;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji";
  line-height: 1.6;
  padding: 2.5rem;
  font-size: 16px;
}
.markdown-body h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: #1f2328; }
.markdown-body h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: #1f2328; }
.markdown-body h3 { font-size: 1.25em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: #1f2328; }
.markdown-body h4 { font-size: 1em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; }
.markdown-body h5 { font-size: 0.875em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; }
.markdown-body p { margin-top: 0; margin-bottom: 1rem; color: #24292f; text-align: justify; }
.markdown-body a { color: #0969da; text-decoration: none; font-weight: 500; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body blockquote { padding: 0 1em; color: #57606a; border-left: 0.25em solid #d0d7de; margin: 1.5em 0; background: #f8f9fa; border-radius: 2px; padding-top: 8px; padding-bottom: 8px; }
.markdown-body ul, .markdown-body ol { padding-left: 2em; margin-top: 0; margin-bottom: 1rem; }
.markdown-body ul { list-style-type: disc; }
.markdown-body ol { list-style-type: decimal; }
.markdown-body li { margin-top: 0.25em; margin-bottom: 0.25em; }
.markdown-body code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(175,184,193,0.2); border-radius: 6px; font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 12px; margin-top: 1.5em; margin-bottom: 1.5em; }
.markdown-body pre code { background-color: transparent; padding: 0; margin: 0; font-size: 100%; border-radius: 0; }
.markdown-body table { border-spacing: 0; border-collapse: collapse; width: 100%; margin-top: 1.5em; margin-bottom: 1.5em; }
.markdown-body td, .markdown-body th { padding: 8px 13px; border: 1px solid #d0d7de; }
.markdown-body th { font-weight: 600; background-color: #f6f8fa; }
.markdown-body tr { background-color: #ffffff; }
.markdown-body tr:nth-child(2n) { background-color: #f1f3f5; }
.markdown-body hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #d0d7de; border: 0; }
.markdown-body img { max-width: 100%; box-sizing: content-box; background-color: #ffffff; }

/* Code Syntax Highlighting colors */
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: #6a737d; font-style: italic; }
.token.punctuation { color: #24292f; }
.token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #0550ae; }
.token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #116329; }
.token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #24292f; }
.token.atrule, .token.attr-value, .token.keyword { color: #cf222e; }
.token.function, .token.class-name { color: #8250df; }
.token.regex, .token.important, .token.variable { color: #953800; }
:root { --color-accent: #0969da; }`
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    description: 'Sleek dark reader style optimized for high readability in dim light.',
    isDark: true,
    cssRules: `/* GitHub Dark CSS Theme */
.markdown-body {
  color: #c9d1d9;
  background-color: #0d1117;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji";
  line-height: 1.6;
  padding: 2.5rem;
  font-size: 16px;
}
.markdown-body h1 { font-size: 2em; border-bottom: 1px solid #21262d; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: #f0f6fc; }
.markdown-body h2 { font-size: 1.5em; border-bottom: 1px solid #21262d; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: #f0f6fc; }
.markdown-body h3 { font-size: 1.25em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: #f0f6fc; }
.markdown-body h4 { font-size: 1em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; }
.markdown-body h5 { font-size: 0.875em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; }
.markdown-body p { margin-top: 0; margin-bottom: 1rem; color: #c9d1d9; text-align: justify; }
.markdown-body a { color: #58a6ff; text-decoration: none; font-weight: 500; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body blockquote { padding: 0 1em; color: #8b949e; border-left: 0.25em solid #30363d; margin: 1.5em 0; background: #161b22; border-radius: 2px; padding-top: 8px; padding-bottom: 8px; }
.markdown-body ul, .markdown-body ol { padding-left: 2em; margin-top: 0; margin-bottom: 1rem; }
.markdown-body ul { list-style-type: disc; }
.markdown-body ol { list-style-type: decimal; }
.markdown-body li { margin-top: 0.25em; margin-bottom: 0.25em; }
.markdown-body code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(110,118,129,0.4); border-radius: 6px; font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #161b22; border-radius: 12px; border: 1px solid #30363d; margin-top: 1.5em; margin-bottom: 1.5em; }
.markdown-body pre code { background-color: transparent; padding: 0; margin: 0; font-size: 100%; border-radius: 0; }
.markdown-body table { border-spacing: 0; border-collapse: collapse; width: 100%; margin-top: 1.5em; margin-bottom: 1.5em; }
.markdown-body td, .markdown-body th { padding: 8px 13px; border: 1px solid #30363d; }
.markdown-body th { font-weight: 600; background-color: #161b22; }
.markdown-body tr { background-color: #0d1117; }
.markdown-body tr:nth-child(2n) { background-color: #161b22; }
.markdown-body hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #30363d; border: 0; }
.markdown-body img { max-width: 100%; box-sizing: content-box; background-color: #0d1117; }

/* Code Syntax Higgs coding colors */
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: #8b949e; font-style: italic; }
.token.punctuation { color: #c9d1d9; }
.token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #79c0ff; }
.token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #7ee787; }
.token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #c9d1d9; }
.token.atrule, .token.attr-value, .token.keyword { color: #ff7b72; }
.token.function, .token.class-name { color: #d2a8ff; }
.token.regex, .token.important, .token.variable { color: #ff914d; }
:root { --color-accent: #58a6ff; }`
  },
  {
    id: 'nord-frost',
    name: 'Nord Minimal',
    description: 'Clean arctic dark palette with frozen accent colors.',
    isDark: true,
    cssRules: `/* Nord Frost Theme */
.markdown-body {
  color: #d8dee9;
  background-color: #2e3440;
  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  line-height: 1.7;
  padding: 3rem;
  font-size: 15px;
}
.markdown-body h1 { font-size: 2.2em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 650; color: #8fbcbb; font-family: "Space Grotesk", sans-serif; }
.markdown-body h2 { font-size: 1.6em; border-bottom: 1px solid #3b4252; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: #88c0d0; }
.markdown-body h3 { font-size: 1.3em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; color: #81a1c1; }
.markdown-body p { margin-top: 0; margin-bottom: 1.2rem; color: #e5e9f0; }
.markdown-body a { color: #88c0d0; font-weight: 500; }
.markdown-body a:hover { text-decoration: underline; color: #8fbcbb; }
.markdown-body blockquote { padding: 0.5em 1.2em; color: #d8dee9; border-left: 4px solid #81a1c1; margin: 1.5em 0; background: #3b4252; border-radius: 4px; }
.markdown-body code { padding: 0.2em 0.4em; margin: 0; font-size: 90%; background-color: #3b4252; color: #eceff4; border-radius: 4px; font-family: "JetBrains Mono", monospace; }
.markdown-body pre { padding: 20px; overflow: auto; background-color: #242933; border-radius: 8px; border: 1px solid #3b4252; margin-top: 1.5em; margin-bottom: 1.5em; }
.markdown-body pre code { background-color: transparent; padding: 0; color: #d8dee9; }
.markdown-body table { width: 100%; border-collapse: collapse; margin-top: 1.5em; margin-bottom: 1.5em; }
.markdown-body td, .markdown-body th { padding: 10px 12px; border: 1px solid #3b4252; }
.markdown-body th { background-color: #3b4252; color: #81a1c1; }
.markdown-body tr { background-color: #2e3440; }
.markdown-body tr:nth-child(2n) { background-color: #242933; }
.markdown-body hr { height: 2px; padding: 0; margin: 30px 0; background-color: #3b4252; border: 0; }

/* Nord Prism Color themes */
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: #4c566a; font-style: italic; }
.token.punctuation { color: #eceff4; }
.token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #81a1c1; }
.token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #a3be8c; }
.token.operator, .token.entity, .token.url, .token.string { color: #d8dee9; }
.token.atrule, .token.attr-value, .token.keyword { color: #81a1c1; }
.token.function, .token.class-name { color: #88c0d0; }
.token.regex, .token.important, .token.variable { color: #ebcb8b; }
:root { --color-accent: #88c0d0; }`
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Vibrant, atmospheric dark theme for true keyboard vampires.',
    isDark: true,
    cssRules: `/* Dracula Goth theme */
.markdown-body {
  color: #f8f8f2;
  background-color: #282a36;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  padding: 2.5rem;
}
.markdown-body h1 { font-size: 2.1em; color: #ff79c6; border-bottom: 1px solid #44475a; padding-bottom: 0.3em; margin-top: 1.5em; }
.markdown-body h2 { font-size: 1.6em; color: #50fa7b; border-bottom: 1px solid #44475a; padding-bottom: 0.3em; margin-top: 1.5em; }
.markdown-body h3 { font-size: 1.3em; color: #8be9fd; margin-top: 1.5em; }
.markdown-body p { margin-top: 0; margin-bottom: 1rem; color: #f8f8f2; }
.markdown-body a { color: #8be9fd; font-weight: 500; }
.markdown-body a:hover { text-decoration: underline; color: #ff79c6; }
.markdown-body blockquote { padding: 0.5em 1.2em; color: #f1fa8c; border-left: 4px solid #ff79c6; background: #44475a; border-radius: 4px; margin: 1.5em 0; }
.markdown-body code { padding: 0.2em 0.4em; background-color: #44475a; color: #ff79c6; border-radius: 4px; font-family: Consolas, Monaco, monospace; }
.markdown-body pre { padding: 18px; background-color: #1e1f29; border-radius: 8px; border: 1px solid #44475a; overflow: auto; margin-top: 1.5em; }
.markdown-body pre code { background-color: transparent; color: #f8f8f2; }
.markdown-body table { width: 100%; border-collapse: collapse; margin-top: 1.5em; }
.markdown-body td, .markdown-body th { padding: 8px 12px; border: 1px solid #44475a; }
.markdown-body th { background-color: #44475a; color: #50fa7b; }
.markdown-body tr { background-color: #282a36; }
.markdown-body tr:nth-child(2n) { background-color: #1e1f29; }
.markdown-body hr { height: 2px; background-color: #44475a; border: 0; margin: 30px 0; }

/* Dracula prism */
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: #6272a4; font-style: italic; }
.token.punctuation { color: #f8f8f2; }
.token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #ff79c6; }
.token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #f1fa8c; }
.token.operator, .token.entity, .token.url { color: #9aa5ce; }
.token.atrule, .token.attr-value, .token.keyword { color: #ff79c6; }
.token.function, .token.class-name { color: #50fa7b; }
.token.regex, .token.important, .token.variable { color: #ffb86c; }
:root { --color-accent: #ff79c6; }`
  },
  {
    id: 'solarized-warm',
    name: 'Solarized Warm',
    description: 'Warm cream bookish parchment look that shields eyes from high fatigue.',
    isDark: false,
    cssRules: `/* Solarized Warm */
.markdown-body {
  color: #586e75;
  background-color: #fdf6e3;
  font-family: Garamond, Georgia, serif;
  line-height: 1.7;
  padding: 3rem;
  font-size: 17px;
}
.markdown-body h1 { font-size: 2.2em; color: #b58900; margin-top: 1.5em; font-family: Georgia, serif; border-bottom: 2px solid #eee8d5; padding-bottom: 0.2rem; }
.markdown-body h2 { font-size: 1.6em; color: #cb4b16; border-bottom: 1px solid #eee8d5; padding-bottom: 0.2rem; margin-top: 1.5em; }
.markdown-body h3 { font-size: 1.3em; color: #268bd2; margin-top: 1.5em; }
.markdown-body p { margin-bottom: 1.2rem; text-align: justify; }
.markdown-body a { color: #268bd2; font-weight: 500; text-decoration: underline; }
.markdown-body a:hover { color: #2aa198; }
.markdown-body blockquote { padding: 0.8em 1.5em; color: #657b83; border-left: 4px solid #93a1a1; background: #eee8d5; font-style: italic; margin: 1.5em 0; }
.markdown-body code { padding: 0.2em 0.4em; background-color: #eee8d5; color: #d33682; border-radius: 4px; font-family: monospace; font-size: 85%; }
.markdown-body pre { padding: 18px; background-color: #eee8d5; border-radius: 6px; overflow: auto; border: 1px solid #93a1a1; margin: 1.5em 0; }
.markdown-body pre code { background-color: transparent; color: #586e75; }
.markdown-body td, .markdown-body th { padding: 10px; border: 1px solid #eee8d5; }
.markdown-body th { background-color: #eee8d5; color: #586e75; }
.markdown-body tr { background-color: #fdf6e3; }
.markdown-body tr:nth-child(2n) { background-color: #eee8d5; }
.markdown-body hr { height: 2px; background-color: #93a1a1; border: 0; margin: 30px 0; }

/* Solarized syntax */
.token.comment { color: #93a1a1; font-style: italic; }
.token.punctuation { color: #586e75; }
.token.property, .token.tag, .token.boolean, .token.number, .token.constant { color: #b58900; }
.token.selector, .token.attr-name, .token.string { color: #2aa198; }
.token.keyword { color: #859900; }
.token.function { color: #268bd2; }
.token.regex { color: #cb4b16; }
:root { --color-accent: #268bd2; }`
  },
  {
    id: 'forest-pine',
    name: 'Forest Whisper',
    description: 'Calm moss-green reader with ivory highlights for relaxed study.',
    isDark: true,
    cssRules: `/* Forest Whisper CSS */
.markdown-body {
  color: #e2e8f0;
  background-color: #141f1a;
  font-family: system-ui, sans-serif;
  line-height: 1.65;
  padding: 2.5rem;
  font-size: 16px;
}
.markdown-body h1 { color: #a7f3d0; border-bottom: 1px solid #2d3748; padding-bottom: 0.3em; margin-top: 1.5em; font-weight: 600; }
.markdown-body h2 { color: #6ee7b7; border-bottom: 1px solid #2d3748; padding-bottom: 0.3em; margin-top: 1.5em; font-weight: 600; }
.markdown-body h3 { color: #a7f3d0; margin-top: 1.5em; }
.markdown-body p { margin-bottom: 1rem; }
.markdown-body a { color: #34d399; font-weight: 500; }
.markdown-body a:hover { text-decoration: underline; color: #6ee7b7; }
.markdown-body blockquote { padding: 0.5em 1.2em; border-left: 4px solid #10b981; background: #1e2e26; color: #10b981; border-radius: 4px; font-style: italic; }
.markdown-body code { padding: 0.2rem 0.4rem; background-color: #1e2e26; color: #a7f3d0; border-radius: 4px; font-family: monospace; }
.markdown-body pre { padding: 16px; background-color: #1f2d24; border-radius: 8px; border: 1px solid #2d3748; overflow: auto; }
.markdown-body pre code { background-color: transparent; color: #e2e8f0; }
.markdown-body td, .markdown-body th { padding: 10px; border: 1px solid #2d3748; }
.markdown-body th { background-color: #1e2e26; color: #34d399; }
.markdown-body tr:nth-child(2n) { background-color: #1e2e26; }
.markdown-body hr { height: 2px; background-color: #2d3748; border: 0; margin: 30px 0; }

/* Pine prism */
.token.comment { color: #4b6a5a; font-style: italic; }
.token.punctuation { color: #e2e8f0; }
.token.property, .token.tag, .token.boolean, .token.number { color: #fbbf24; }
.token.selector, .token.string { color: #34d399; }
.token.keyword { color: #6ee7b7; }
.token.function { color: #fbaf5d; }
:root { --color-accent: #34d399; }`
  },
  {
    id: 'retro-terminal',
    name: 'Retro Terminal',
    description: 'Vibrant amber phosphor screen emulator with scanline monospace layout.',
    isDark: true,
    cssRules: `/* Retro Terminal Phosphor Monospace Style */
.markdown-body {
  color: #ffb000;
  background-color: #0c0800;
  font-family: "Courier New", Courier, "Fira Code", monospace;
  line-height: 1.5;
  padding: 2.5rem;
  font-size: 15px;
  text-shadow: 0 0 2px rgba(255,176,0,0.5);
  border: 1px solid #331f00;
  border-radius: 4px;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  color: #ffb000;
  text-transform: uppercase;
  border-bottom: 1px dashed #ffb000;
  padding-bottom: 0.3em;
  margin-top: 1.5em;
  font-weight: bold;
}
.markdown-body a { color: #ffffff; text-decoration: underline; text-shadow: 0 0 2px #fff; }
.markdown-body blockquote { border-left: 4px solid #ffb000; padding: 0 1em; margin: 1.5em 0; color: #ffb000; opacity: 0.8; }
.markdown-body code { background: #1a1000; border: 1px solid #331f00; color: #ffffff; padding: 0.2em; font-family: monospace; }
.markdown-body pre { background: #050300; border: 1px solid #ffb000; padding: 16px; overflow: auto; border-radius: 4px; }
.markdown-body pre code { background: transparent; border: 0; color: #ffb000; }
.markdown-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 1px solid #ffb000; }
.markdown-body td, .markdown-body th { border: 1px dashed #ffb000; padding: 8px 12px; }
.markdown-body th { background: #221400; color: #ffb000; }
.markdown-body tr { background: #0c0800; }
.markdown-body tr:nth-child(2n) { background: #1a1000; }
.markdown-body hr { border: 0; outline: 0; border-top: 1px dashed #ffb000; margin: 2rem 0; }

/* Phosphor Syntax Highlighter styles */
.token.comment { color: rgba(255,176,0,0.4); font-style: italic; }
.token.punctuation, .token.keyword { color: #ffb000; font-weight: bold; }
.token.property, .token.string, .token.number { color: #ffffff; text-shadow: 0 0 4px rgba(255,255,255,0.8); }
.token.function { color: #ffb000; text-decoration: underline; }
:root { --color-accent: #ffb000; }`
  }
];

export const GENERAL_THEMES_INFO: Record<string, {
  appBg: string;
  sidebarBg: string;
  cardBg: string;
  text: string;
  isDark: boolean;
  headerBg: string;
  footerBg: string;
  editorBg: string;
  borderClass: string;
  activeFileBg: string;
  gutterBg: string;
}> = {
  'elegant-dark': {
    appBg: 'bg-zinc-950',
    sidebarBg: 'bg-zinc-950 border-r border-white/5',
    cardBg: 'bg-zinc-900 border border-white/5',
    text: 'text-zinc-100',
    isDark: true,
    headerBg: 'bg-zinc-950 border-b border-white/5',
    footerBg: 'bg-zinc-950',
    editorBg: 'bg-zinc-950',
    borderClass: 'border-white/5',
    activeFileBg: 'bg-accent/15 text-accent border border-accent/20',
    gutterBg: 'bg-zinc-950 border-r border-white/5 text-zinc-600',
  },
  'github-light': {
    appBg: 'bg-white',
    sidebarBg: 'bg-slate-50 border-r border-slate-200',
    cardBg: 'bg-white shadow-sm ring-1 ring-slate-200',
    text: 'text-slate-900',
    isDark: false,
    headerBg: 'bg-slate-50 border-b border-slate-200',
    footerBg: 'bg-slate-50',
    editorBg: 'bg-white',
    borderClass: 'border-slate-200',
    activeFileBg: 'bg-slate-200/60 text-slate-900 border border-slate-300/50',
    gutterBg: 'bg-slate-50 border-r border-slate-200 text-slate-400',
  },
  'github-dark': {
    appBg: 'bg-[#0d1117]',
    sidebarBg: 'bg-[#161b22] border-r border-[#30363d]',
    cardBg: 'bg-[#0d1117] border border-[#30363d]',
    text: 'text-[#c9d1d9]',
    isDark: true,
    headerBg: 'bg-[#161b22] border-b border-[#30363d]',
    footerBg: 'bg-[#161b22]',
    editorBg: 'bg-[#0d1117]',
    borderClass: 'border-[#30363d]',
    activeFileBg: 'bg-[#21262d] text-white border border-[#30363d]',
    gutterBg: 'bg-[#161b22] border-r border-[#30363d] text-[#8b949e]',
  },
  'nord-frost': {
    appBg: 'bg-[#2e3440]',
    sidebarBg: 'bg-[#242933] border-r border-[#3b4252]',
    cardBg: 'bg-[#2e3440] border border-[#3b4252]',
    text: 'text-[#d8dee9]',
    isDark: true,
    headerBg: 'bg-[#242933] border-b border-[#3b4252]',
    footerBg: 'bg-[#242933]',
    editorBg: 'bg-[#2e3440]',
    borderClass: 'border-[#3b4252]',
    activeFileBg: 'bg-[#3b4252] text-[#88c0d0] border border-[#4c566a]',
    gutterBg: 'bg-[#242933] border-r border-[#3b4252] text-[#4c566a]',
  },
  'dracula': {
    appBg: 'bg-[#282a36]',
    sidebarBg: 'bg-[#1e1f29] border-r border-[#44475a]',
    cardBg: 'bg-[#282a36] border border-[#44475a]',
    text: 'text-[#f8f8f2]',
    isDark: true,
    headerBg: 'bg-[#1e1f29] border-b border-[#44475a]',
    footerBg: 'bg-[#1e1f29]',
    editorBg: 'bg-[#282a36]',
    borderClass: 'border-[#44475a]',
    activeFileBg: 'bg-[#44475a] text-[#8be9fd] border border-[#6272a4]',
    gutterBg: 'bg-[#1e1f29] border-r border-[#44475a] text-[#6272a4]',
  },
  'solarized-warm': {
    appBg: 'bg-[#fdf6e3]',
    sidebarBg: 'bg-[#eee8d5] border-r border-[#93a1a1]/30',
    cardBg: 'bg-[#fdf6e3] border border-[#93a1a1]/30',
    text: 'text-[#586e75]',
    isDark: false,
    headerBg: 'bg-[#eee8d5] border-b border-[#93a1a1]/30',
    footerBg: 'bg-[#eee8d5]',
    editorBg: 'bg-[#fdf6e3]',
    borderClass: 'border-[#93a1a1]/30',
    activeFileBg: 'bg-[#dfd8c5] text-[#268bd2] border border-[#93a1a1]/40',
    gutterBg: 'bg-[#eee8d5] border-r border-[#93a1a1]/30 text-[#93a1a1]',
  },
  'forest-pine': {
    appBg: 'bg-[#141f1a]',
    sidebarBg: 'bg-[#1a2922] border-r border-[#2d3748]/60',
    cardBg: 'bg-[#141f1a] border border-[#2d3748]/60',
    text: 'text-[#e2e8f0]',
    isDark: true,
    headerBg: 'bg-[#1a2922] border-b border-[#2d3748]/60',
    footerBg: 'bg-[#1a2922]',
    editorBg: 'bg-[#141f1a]',
    borderClass: 'border-[#2d3748]/60',
    activeFileBg: 'bg-[#22362d] text-[#34d399] border border-[#2d3748]',
    gutterBg: 'bg-[#1a2922] border-r border-[#2d3748]/60 text-[#4b6a5a]',
  },
  'retro-terminal': {
    appBg: 'bg-[#000000]',
    sidebarBg: 'bg-[#0c0800] border-r border-[#331f00]',
    cardBg: 'bg-[#0c0800] border border-[#331f00]',
    text: 'text-[#ffb000]',
    isDark: true,
    headerBg: 'bg-[#0c0800] border-b border-[#331f00]',
    footerBg: 'bg-[#0c0800]',
    editorBg: 'bg-[#000000]',
    borderClass: 'border-[#331f00]',
    activeFileBg: 'bg-[#1a1000] text-[#ffffff] border border-[#ffb000]',
    gutterBg: 'bg-[#0c0800] border-r border-[#331f00] text-[#ffb000]/60',
  },
  // Default values for custom themes
  'default-custom-dark': {
    appBg: 'bg-zinc-950',
    sidebarBg: 'bg-zinc-900 border-r border-zinc-800',
    cardBg: 'bg-zinc-950 border border-zinc-800',
    text: 'text-zinc-100',
    isDark: true,
    headerBg: 'bg-zinc-900 border-b border-zinc-800',
    footerBg: 'bg-zinc-900',
    editorBg: 'bg-zinc-950',
    borderClass: 'border-zinc-800',
    activeFileBg: 'bg-zinc-800 text-zinc-100 border border-zinc-700',
    gutterBg: 'bg-zinc-900 border-r border-zinc-800 text-zinc-500',
  },
  'default-custom-light': {
    appBg: 'bg-slate-50',
    sidebarBg: 'bg-white border-r border-slate-200',
    cardBg: 'bg-white border border-slate-200 shadow-sm',
    text: 'text-slate-800',
    isDark: false,
    headerBg: 'bg-white border-b border-slate-200',
    footerBg: 'bg-white',
    editorBg: 'bg-slate-50',
    borderClass: 'border-slate-200',
    activeFileBg: 'bg-slate-100 text-slate-800 border border-slate-300',
    gutterBg: 'bg-slate-100 border-r border-slate-200 text-slate-400',
  }
};
