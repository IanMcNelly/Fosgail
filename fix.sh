sed -i 's/          const blockId = simpleHash(value + language);/          const blockId = simpleHash(value + language);\n\n          return <CodeBlock language={language} value={value} blockId={blockId} \/>;/g' src/components/MarkdownOutput.tsx

npm run test && npm run lint:all
