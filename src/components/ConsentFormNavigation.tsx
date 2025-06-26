
import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';

interface ConsentFormNavigationProps {
  sections: any[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  onSave: () => Promise<void>;
  onSubmit: () => Promise<void>;
  submitting?: boolean;
}

const ConsentFormNavigation = ({
  sections,
  activeSection,
  setActiveSection,
  onSave,
  onSubmit,
  submitting = false
}: ConsentFormNavigationProps) => {
  const currentIndex = sections.findIndex(section => section.id === activeSection);
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === sections.length - 1;

  const handlePrevious = () => {
    if (!isFirstSection) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (!isLastSection) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={isFirstSection}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onSave}
          disabled={submitting}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Draft
        </Button>

        {isLastSection ? (
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={submitting}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConsentFormNavigation;
