import React from "react";
import { Repeat, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function RecurringMeetingForm({ 
  isRecurring, 
  setIsRecurring, 
  recurrence, 
  setRecurrence 
}) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-gray-500" />
          <Label>Recurring Meeting</Label>
        </div>
        <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
      </div>

      {isRecurring && (
        <div className="space-y-3 pt-2">
          <div>
            <Label className="text-xs text-gray-500">Repeat</Label>
            <Select 
              value={recurrence.frequency} 
              onValueChange={(v) => setRecurrence({ ...recurrence, frequency: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrence.frequency === 'weekly' && (
            <div>
              <Label className="text-xs text-gray-500">On days</Label>
              <div className="flex gap-1 mt-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                  <button
                    key={day}
                    type="button"
                    className={`w-9 h-9 text-xs rounded-full border transition-colors ${
                      recurrence.days?.includes(idx)
                        ? 'bg-[#1EB053] text-white border-[#1EB053]'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      const days = recurrence.days || [];
                      const newDays = days.includes(idx)
                        ? days.filter(d => d !== idx)
                        : [...days, idx];
                      setRecurrence({ ...recurrence, days: newDays });
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Ends</Label>
              <Select 
                value={recurrence.endType || 'never'} 
                onValueChange={(v) => setRecurrence({ ...recurrence, endType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="after">After occurrences</SelectItem>
                  <SelectItem value="on">On date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recurrence.endType === 'after' && (
              <div>
                <Label className="text-xs text-gray-500">Occurrences</Label>
                <Input
                  type="number"
                  min="1"
                  value={recurrence.occurrences || 10}
                  onChange={(e) => setRecurrence({ ...recurrence, occurrences: parseInt(e.target.value) })}
                />
              </div>
            )}

            {recurrence.endType === 'on' && (
              <div>
                <Label className="text-xs text-gray-500">End Date</Label>
                <Input
                  type="date"
                  value={recurrence.endDate || ''}
                  onChange={(e) => setRecurrence({ ...recurrence, endDate: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}