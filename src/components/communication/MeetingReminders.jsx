import { } from "react";
import { Bell, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REMINDER_OPTIONS = [
  { value: '5', label: '5 minutes before' },
  { value: '10', label: '10 minutes before' },
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
  { value: '60', label: '1 hour before' },
  { value: '1440', label: '1 day before' },
];

export default function MeetingReminders({ reminders = [], setReminders }) {
  const addReminder = () => {
    if (reminders.length < 3) {
      setReminders([...reminders, '15']);
    }
  };

  const removeReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const updateReminder = (index, value) => {
    const newReminders = [...reminders];
    newReminders[index] = value;
    setReminders(newReminders);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-500" />
          <Label>Reminders</Label>
        </div>
        {reminders.length < 3 && (
          <Button type="button" variant="ghost" size="sm" onClick={addReminder}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {reminders.length === 0 ? (
        <p className="text-sm text-gray-500">No reminders set</p>
      ) : (
        <div className="space-y-2">
          {reminders.map((reminder, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Select value={reminder} onValueChange={(v) => updateReminder(idx, v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9"
                onClick={() => removeReminder(idx)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}