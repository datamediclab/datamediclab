// components/shared/dialogs/ConfirmActionDialog.tsx

import { Dialog, DialogContent, DialogTitle } from "@/components/shared/dialogs/DialogWrapper";
import { Button } from "@/components/ui/Button";

const ConfirmActionDialog = ({
  open,
  onConfirm,
  onCancel,
  title = "คุณแน่ใจหรือไม่?",
  description = "การกระทำนี้ไม่สามารถย้อนกลับได้",
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="text-center space-y-4">
        <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="secondary" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            ยืนยัน
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmActionDialog;
