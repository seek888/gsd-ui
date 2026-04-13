import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

const CodeBlock: Components['code'] = ({ className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const isInline = !match && !String(children).includes('\n');

  if (isInline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  if (match) {
    return (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

const PreBlock: Components['pre'] = ({ children }) => {
  return (
    <pre className="not-prose overflow-auto rounded-md bg-[#1e1e1e] p-4 my-4 text-sm">
      {children}
    </pre>
  );
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="p-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          pre: PreBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
