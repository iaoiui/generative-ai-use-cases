import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Markdown from '../components/Markdown';
import ButtonCopy from '../components/ButtonCopy';
import Select from '../components/Select';
import useChat from '../hooks/useChat';
import useTyping from '../hooks/useTyping';
import { create } from 'zustand';
import { MODELS } from '../hooks/useModel';
import { getPrompter } from '../prompts';
import { useTranslation } from 'react-i18next';

// In a real implementation, we would fetch this from the repository
// For this implementation, we're using the content directly
const README_CONTENT = `# Generative AI Use Cases (GenU)

Well-architected application implementation with business use cases for utilizing generative AI in business operations.

## GenU Usage Patterns

GenU provides various usage patterns including:

- Experience generative AI use cases (Chat, Text Generation, Summarization, etc.)
- Implement RAG (Retrieval-Augmented Generation) with Amazon Kendra or Knowledge Base
- Use custom AI agents or Bedrock Flows within your organization
- Create custom use cases with "Use Case Builder"

## Deployment

GenU deployment uses AWS Cloud Development Kit (CDK). Alternative deployment methods include:
- AWS CloudShell
- Workshop (English/Japanese)

## Architecture

GenU has a well-architected implementation with comprehensive documentation for deployment options, updates, local development, and resource management.

## Cost Estimation

Cost estimation examples are available for different configurations:
- Simple Version (without RAG)
- With RAG (Amazon Kendra)
- With RAG (Knowledge Base)

## Security & License

This library is licensed under the MIT-0 License.`;

type StateType = {
  readmeContent: string;
  setReadmeContent: (s: string) => void;
  summarizedContent: string;
  setSummarizedContent: (s: string) => void;
  clear: () => void;
};

const useAmazonQDeveloperPageState = create<StateType>((set) => {
  const INIT_STATE = {
    readmeContent: README_CONTENT,
    summarizedContent: '',
  };
  return {
    ...INIT_STATE,
    setReadmeContent: (s: string) => {
      set(() => ({
        readmeContent: s,
      }));
    },
    setSummarizedContent: (s: string) => {
      set(() => ({
        summarizedContent: s,
      }));
    },
    clear: () => {
      set(INIT_STATE);
    },
  };
});

const AmazonQDeveloperPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    readmeContent,
    setReadmeContent,
    summarizedContent,
    setSummarizedContent,
    clear,
  } = useAmazonQDeveloperPageState();
  const { pathname } = useLocation();
  const {
    getModelId,
    setModelId,
    loading,
    messages,
    postChat,
    clear: clearChat,
    updateSystemContextByModel,
  } = useChat(pathname);
  const { setTypingTextInput, typingTextOutput } = useTyping(loading);
  const { modelIds: availableModels, modelDisplayName } = MODELS;
  const modelId = getModelId();
  const prompter = useMemo(() => {
    return getPrompter(modelId);
  }, [modelId]);

  useEffect(() => {
    updateSystemContextByModel();
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [prompter]);

  const disabledExec = useMemo(() => {
    return readmeContent === '' || loading;
  }, [readmeContent, loading]);

  useEffect(() => {
    const _modelId = !modelId ? availableModels[0] : modelId;
    setModelId(_modelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, availableModels]);

  useEffect(() => {
    setTypingTextInput(summarizedContent);
  }, [summarizedContent, setTypingTextInput]);

  const getSummary = (content: string) => {
    postChat(
      prompter.summarizePrompt({
        sentence: content,
        context: 'Provide a concise summary of the README.md file for the Generative AI Use Cases (GenU) project.',
      }),
      true
    );
  };

  // Display the response in real time
  useEffect(() => {
    if (messages.length === 0) return;
    const _lastMessage = messages[messages.length - 1];
    if (_lastMessage.role !== 'assistant') return;
    const _response = messages[messages.length - 1].content;
    setSummarizedContent(_response.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Execute summary automatically on page load
  useEffect(() => {
    if (readmeContent && !summarizedContent && !loading) {
      getSummary(readmeContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readmeContent]);

  // Execute summary
  const onClickExec = useCallback(() => {
    if (loading) return;
    getSummary(readmeContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readmeContent, loading]);

  // Reset
  const onClickClear = useCallback(() => {
    clear();
    clearChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-12">
      <div className="invisible col-span-12 my-0 flex h-0 items-center justify-center text-xl font-semibold lg:visible lg:my-5 lg:h-min print:visible print:my-5 print:h-min">
        Amazon Q Developer
      </div>
      <div className="col-span-12 col-start-1 mx-2 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">
        <Card label="README.md Summary">
          <div className="mb-2 flex w-full">
            <Select
              value={modelId}
              onChange={setModelId}
              options={availableModels.map((m) => {
                return { value: m, label: modelDisplayName(m) };
              })}
            />
          </div>

          <div className="mt-5 rounded border border-black/30 p-1.5">
            <h2 className="text-lg font-bold mb-2">Summary</h2>
            <Markdown>{typingTextOutput}</Markdown>
            {!loading && summarizedContent === '' && (
              <div className="text-gray-500">
                Generating summary...
              </div>
            )}
            {loading && (
              <div className="border-aws-sky size-5 animate-spin rounded-full border-4 border-t-transparent"></div>
            )}
            <div className="flex w-full justify-end">
              <ButtonCopy
                text={summarizedContent}
                interUseCasesKey="summarizedContent"></ButtonCopy>
            </div>
          </div>

          <div className="mt-5">
            <h2 className="text-lg font-bold mb-2">Original README.md</h2>
            <div className="rounded border border-black/30 p-1.5 max-h-96 overflow-auto">
              <Markdown>{readmeContent}</Markdown>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button outlined onClick={onClickClear} disabled={disabledExec}>
              {t('common.clear')}
            </Button>

            <Button disabled={disabledExec} onClick={onClickExec}>
              Regenerate Summary
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AmazonQDeveloperPage;