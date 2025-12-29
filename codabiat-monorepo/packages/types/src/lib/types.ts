
export interface Article {
  id: string;
  title: string;
  category: 'Programming' | 'E-Lit' | 'Theory';
  excerpt: string;
  date: string;
  tags: string[];
}

export interface GeneratedContent {
  text: string;
  codeSnippet?: string;
  type: 'poem' | 'explanation' | 'story';
}

export enum ViewState {
  HOME = 'HOME',
  ARCHIVE = 'ARCHIVE',
  LAB = 'LAB', 
  ABOUT = 'ABOUT',
  LEARN = 'LEARN'
}

// Learning Platform Types
export interface Lesson {
  id: string;
  title: string;
  content: string; // Markdown or HTML content
  initialCode: string; // Starter code for the playground
  challenge?: string; // Description of the task
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string; // Lucide icon name string representation or mapped manually
  modules: Module[];
  techStack: string[];
}
