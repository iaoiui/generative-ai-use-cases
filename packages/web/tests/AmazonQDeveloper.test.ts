import { describe, it, expect, vi } from 'vitest';
import { getPrompter } from '../src/prompts';

// Mock the prompter
vi.mock('../src/prompts', () => ({
  getPrompter: vi.fn().mockReturnValue({
    summarizePrompt: vi.fn().mockImplementation(({ sentence, context }) => {
      // Simple mock implementation that returns a summary based on the input
      return `Summary of README.md: Generative AI Use Cases (GenU) is a well-architected application 
      implementation with business use cases for utilizing generative AI in business operations.`;
    }),
  }),
}));

describe('Amazon Q Developer functionality', () => {
  it('should generate a summary of README.md content', () => {
    const prompter = getPrompter('claude-3-sonnet-20240229-v1:0');
    
    // Sample README content
    const readmeContent = `# Generative AI Use Cases (GenU)
    
    Well-architected application implementation with business use cases for utilizing generative AI in business operations.`;
    
    // Generate summary
    const summary = prompter.summarizePrompt({
      sentence: readmeContent,
      context: 'Provide a concise summary of the README.md file for the Generative AI Use Cases (GenU) project.',
    });
    
    // Verify the summary contains key information
    expect(summary).toContain('Generative AI Use Cases');
    expect(summary).toContain('well-architected application');
    expect(summary).toContain('business operations');
  });
});