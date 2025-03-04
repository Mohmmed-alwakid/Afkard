'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StudyFormData } from '../create-study-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  MessageSquare, 
  TextIcon, 
  Sliders, 
  ListChecks, 
  CheckCheck, 
  Clock3 
} from 'lucide-react';

interface StudyTestPlanProps {
  formData: StudyFormData;
  updateFormData: (data: Partial<StudyFormData>) => void;
  userProjects: { id: string; title: string }[];
}

interface BlockType {
  id: string;
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// Block type definitions
const blockTypes: BlockType[] = [
  { 
    id: 'welcome', 
    type: 'welcome', 
    label: 'Welcome Screen', 
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Introduction to your study' 
  },
  { 
    id: 'open_question', 
    type: 'open_question', 
    label: 'Open Question', 
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Free-form text answers' 
  },
  { 
    id: 'simple_input', 
    type: 'simple_input', 
    label: 'Simple Input', 
    icon: <TextIcon className="h-4 w-4" />,
    description: 'Short text input field' 
  },
  { 
    id: 'opinion_scale', 
    type: 'opinion_scale', 
    label: 'Opinion Scale', 
    icon: <Sliders className="h-4 w-4" />,
    description: 'Rating scale (1-5, 1-10)' 
  },
  { 
    id: 'multiple_choice', 
    type: 'multiple_choice', 
    label: 'Multiple Choice', 
    icon: <ListChecks className="h-4 w-4" />,
    description: 'Select one or more options' 
  },
  { 
    id: 'yes_no', 
    type: 'yes_no', 
    label: 'Yes/No', 
    icon: <CheckCheck className="h-4 w-4" />,
    description: 'Simple yes or no question' 
  },
  { 
    id: 'five_second_test', 
    type: 'five_second_test', 
    label: '5-Second Test', 
    icon: <Clock3 className="h-4 w-4" />,
    description: 'Timed first impressions test' 
  }
];

export function StudyTestPlan({ formData, updateFormData }: StudyTestPlanProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<any | null>(null);

  const addBlock = (blockType: string) => {
    const newBlockId = uuidv4();
    const newBlock = {
      id: newBlockId,
      type: blockType,
      title: `New ${blockType.replace('_', ' ')}`,
      content: getDefaultContentForType(blockType),
    };

    const updatedBlocks = [...formData.test_plan.blocks, newBlock];
    
    updateFormData({
      test_plan: {
        ...formData.test_plan,
        blocks: updatedBlocks,
      },
    });

    // Automatically select the new block for editing
    setActiveBlockId(newBlockId);
    setEditingBlock(newBlock);
  };

  const removeBlock = (blockId: string) => {
    const updatedBlocks = formData.test_plan.blocks.filter(block => block.id !== blockId);
    
    updateFormData({
      test_plan: {
        ...formData.test_plan,
        blocks: updatedBlocks,
      },
    });

    if (activeBlockId === blockId) {
      setActiveBlockId(null);
      setEditingBlock(null);
    }
  };

  const updateBlock = (blockId: string, updatedData: any) => {
    const updatedBlocks = formData.test_plan.blocks.map(block => {
      if (block.id === blockId) {
        const updatedBlock = { ...block, ...updatedData };
        if (activeBlockId === blockId) {
          setEditingBlock(updatedBlock);
        }
        return updatedBlock;
      }
      return block;
    });
    
    updateFormData({
      test_plan: {
        ...formData.test_plan,
        blocks: updatedBlocks,
      },
    });
  };

  const handleBlockSelect = (blockId: string) => {
    const selectedBlock = formData.test_plan.blocks.find(block => block.id === blockId);
    setActiveBlockId(blockId);
    setEditingBlock(selectedBlock || null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const blocks = [...formData.test_plan.blocks];
    const [reorderedBlock] = blocks.splice(result.source.index, 1);
    blocks.splice(result.destination.index, 0, reorderedBlock);

    updateFormData({
      test_plan: {
        ...formData.test_plan,
        blocks,
      },
    });
  };

  // Helper to generate default content for different block types
  const getDefaultContentForType = (blockType: string) => {
    switch (blockType) {
      case 'welcome':
        return {
          heading: 'Welcome to our study',
          message: 'Thank you for participating in this study. Your feedback is valuable to us.',
          showTimer: false,
          timerDuration: 0,
        };
      case 'open_question':
        return {
          question: 'Please share your thoughts',
          description: 'We would like to understand your perspective',
          required: true,
          placeholder: 'Type your answer here...',
        };
      case 'simple_input':
        return {
          question: 'Please enter your response',
          description: '',
          required: true,
          placeholder: 'Your answer',
          maxLength: 100,
        };
      case 'opinion_scale':
        return {
          question: 'Rate your experience',
          description: 'How would you rate your overall experience?',
          min: 1,
          max: 5,
          step: 1,
          minLabel: 'Poor',
          maxLabel: 'Excellent',
          required: true,
        };
      case 'multiple_choice':
        return {
          question: 'Select an option',
          description: 'Choose the option that best applies',
          options: ['Option 1', 'Option 2', 'Option 3'],
          allowMultiple: false,
          required: true,
        };
      case 'yes_no':
        return {
          question: 'Would you recommend our product?',
          description: '',
          required: true,
        };
      case 'five_second_test':
        return {
          heading: '5-Second Test',
          description: 'You will be shown an image for 5 seconds. Please focus on the screen.',
          imageUrl: '',
          followUpQuestion: 'What do you remember seeing?',
          timerDuration: 5,
        };
      default:
        return {};
    }
  };

  // Render block editor based on block type
  const renderBlockEditor = () => {
    if (!editingBlock) return null;

    switch (editingBlock.type) {
      case 'welcome':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="welcome-heading">Heading</Label>
              <Input
                id="welcome-heading"
                value={editingBlock.content.heading || ''}
                onChange={(e) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, heading: e.target.value }
                })}
                placeholder="Welcome to our study"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="welcome-message">Welcome Message</Label>
              <Textarea
                id="welcome-message"
                value={editingBlock.content.message || ''}
                onChange={(e) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, message: e.target.value }
                })}
                placeholder="Thank you for participating in this study..."
                className="min-h-32"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingBlock.content.showTimer || false}
                onCheckedChange={(checked) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, showTimer: checked }
                })}
                id="welcome-timer"
              />
              <Label htmlFor="welcome-timer">Add auto-advance timer</Label>
            </div>
            {editingBlock.content.showTimer && (
              <div className="grid gap-2">
                <Label htmlFor="timer-duration">
                  Timer Duration (seconds): {editingBlock.content.timerDuration || 0}
                </Label>
                <Slider
                  id="timer-duration"
                  value={[editingBlock.content.timerDuration || 0]}
                  min={0}
                  max={60}
                  step={1}
                  onValueChange={(value) => updateBlock(editingBlock.id, {
                    content: { ...editingBlock.content, timerDuration: value[0] }
                  })}
                />
              </div>
            )}
          </div>
        );
      
      case 'open_question':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="question-text">Question</Label>
              <Input
                id="question-text"
                value={editingBlock.content.question || ''}
                onChange={(e) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, question: e.target.value }
                })}
                placeholder="Enter your question"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="question-description">Description (Optional)</Label>
              <Textarea
                id="question-description"
                value={editingBlock.content.description || ''}
                onChange={(e) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, description: e.target.value }
                })}
                placeholder="Provide additional context for your question"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="question-placeholder">Input Placeholder</Label>
              <Input
                id="question-placeholder"
                value={editingBlock.content.placeholder || ''}
                onChange={(e) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, placeholder: e.target.value }
                })}
                placeholder="Type your answer here..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingBlock.content.required || false}
                onCheckedChange={(checked) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, required: checked }
                })}
                id="question-required"
              />
              <Label htmlFor="question-required">Required</Label>
            </div>
          </div>
        );
      
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="mc-question">Question</Label>
              <Input
                id="mc-question"
                value={editingBlock.content.question || ''}
                onChange={(e) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, question: e.target.value }
                })}
                placeholder="Enter your question"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mc-description">Description (Optional)</Label>
              <Textarea
                id="mc-description"
                value={editingBlock.content.description || ''}
                onChange={(e) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, description: e.target.value }
                })}
                placeholder="Provide additional context for your question"
              />
            </div>
            <div className="space-y-3">
              <Label>Options</Label>
              {editingBlock.content.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editingBlock.content.options];
                      newOptions[index] = e.target.value;
                      updateBlock(editingBlock.id, {
                        content: { ...editingBlock.content, options: newOptions }
                      });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      const newOptions = [...editingBlock.content.options];
                      newOptions.splice(index, 1);
                      updateBlock(editingBlock.id, {
                        content: { ...editingBlock.content, options: newOptions }
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  const newOptions = [...(editingBlock.content.options || []), ''];
                  updateBlock(editingBlock.id, {
                    content: { ...editingBlock.content, options: newOptions }
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingBlock.content.allowMultiple || false}
                onCheckedChange={(checked) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, allowMultiple: checked }
                })}
                id="mc-multiple"
              />
              <Label htmlFor="mc-multiple">Allow multiple selections</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingBlock.content.required || false}
                onCheckedChange={(checked) => updateBlock(editingBlock.id, {
                  content: { ...editingBlock.content, required: checked }
                })}
                id="mc-required"
              />
              <Label htmlFor="mc-required">Required</Label>
            </div>
          </div>
        );

      // Add more block type editors here
      default:
        return (
          <div className="p-4 border rounded-md bg-muted/50">
            <p>Edit options for {editingBlock.type.replace('_', ' ')} will be available soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Test Plan</h3>
        <p className="text-muted-foreground mb-6">
          Build your study by adding and configuring blocks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test plan editor */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Flow</CardTitle>
              <CardDescription>
                Drag and drop to reorder blocks. Click a block to edit its content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.test_plan.blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Your study is empty. Add blocks from the panel on the right.
                  </p>
                  <Button onClick={() => addBlock('welcome')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Welcome Block
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="test-plan-blocks">
                    {(provided) => (
                      <div
                        className="space-y-2"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {formData.test_plan.blocks.map((block, index) => {
                          const blockType = blockTypes.find(type => type.type === block.type);
                          return (
                            <Draggable key={block.id} draggableId={block.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center p-3 border rounded-md bg-background hover:bg-accent/30 cursor-pointer transition-colors ${
                                    activeBlockId === block.id ? 'ring-2 ring-primary' : ''
                                  }`}
                                  onClick={() => handleBlockSelect(block.id)}
                                >
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="mr-2 text-muted-foreground"
                                  >
                                    <GripVertical className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      {blockType?.icon && (
                                        <span className="mr-2 text-muted-foreground">
                                          {blockType.icon}
                                        </span>
                                      )}
                                      <span className="font-medium">{block.title}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {blockType?.label || block.type}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeBlock(block.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>

          {/* Block editor */}
          {activeBlockId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Edit {editingBlock?.type.replace('_', ' ')}
                </CardTitle>
                <CardDescription>
                  Configure the selected block
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="block-title">Block Title</Label>
                    <Input
                      id="block-title"
                      value={editingBlock?.title || ''}
                      onChange={(e) => updateBlock(activeBlockId, {
                        title: e.target.value
                      })}
                      placeholder="Enter a title for this block"
                    />
                    <p className="text-sm text-muted-foreground">
                      Internal title for organizing your blocks (not shown to participants)
                    </p>
                  </div>
                  <Separator className="my-4" />
                  {renderBlockEditor()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Block types panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Blocks</CardTitle>
              <CardDescription>
                Choose block types to add to your study
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {blockTypes.map((blockType) => (
                <div
                  key={blockType.id}
                  className="flex items-start p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                  onClick={() => addBlock(blockType.type)}
                >
                  <div className="mt-0.5 mr-3 text-muted-foreground">
                    {blockType.icon}
                  </div>
                  <div>
                    <p className="font-medium">{blockType.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {blockType.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total blocks:</span>
                  <span>{formData.test_plan.blocks.length}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Block types:</span>
                  <div className="flex flex-wrap justify-end gap-1 max-w-[70%]">
                    {Array.from(new Set(formData.test_plan.blocks.map(block => block.type))).map(type => (
                      <Badge key={type} variant="outline">
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 