
import React from 'react';
import { Button } from './ui/button';
import { Save, Send, Loader2 } from 'lucide-react';

interface ConsentFormNavigationProps {
  sections: Array<{ id: string; title: string; }>;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onSave: () => Promise<void>;
  onSubmit: () => Promise<void>;
  submitting?: boolean;
  isFormComplete?: boolean;
}

const ConsentFormNavigation = ({
  sections,
  activeSection,
  setActiveSection,
  onSave,
  onSubmit,
  submitting = false,
  isFormComplete = false
}: ConsentFormNavigationProps) => {
  const currentIndex = sections.findIndex(section => section.id === activeSection);
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === sections.length - 1;

  const handleNext = () => {
    if (!isLastSection) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-6 bg-white border-t">
      {/* Previous Button */}
      <div className="w-full sm:w-auto">
        {!isFirstSection && (
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
        )}
      </div>

      {/* Center Actions */}
      <div className="flex gap-3 w-full sm:w-auto justify-center">
        {/* Save Button */}
        <Button
          onClick={onSave}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Draft
        </Button>

        {/* Submit Button - Show if form is complete OR on last section */}
        {(isFormComplete || isLastSection) && (
          <Button
            onClick={onSubmit}
            disabled={submitting || !isFormComplete}
            size="lg"
            className="bg-[#ef4805] hover:bg-[#d63d04] text-white flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Form
              </>
            )}
          </Button>
        )}
      </div>

      {/* Next Button */}
      <div className="w-full sm:w-auto">
        {!isLastSection && (
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full sm:w-auto bg-[#ef4805] hover:bg-[#d63d04] text-white"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConsentFormNavigation;
