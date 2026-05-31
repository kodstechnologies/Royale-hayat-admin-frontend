import { useState } from "react";
import { Button } from "@/components/ui/button";

type StatusUpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  currentStatus: string;
  itemName: string;
};

const StatusUpdateModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  itemName,
}: StatusUpdateModalProps) => {
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-2">Update Status</h3>
        <p className="text-sm text-slate-600 mb-4">
          Change status for <span className="font-semibold">{itemName}</span> to{" "}
          <span className="font-semibold">{currentStatus}</span>
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Note (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a note for this status change..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent"
            rows={3}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onConfirm(comment)}>Confirm Status Change</Button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
