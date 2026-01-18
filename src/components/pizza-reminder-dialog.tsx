'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUsageTracker } from '@/hooks/use-usage-tracker';

export function PizzaReminderDialog() {
  const router = useRouter();
  const { shouldShowReminder, dismiss, snooze, markDonated } = useUsageTracker();

  const handleLearnMore = () => {
    markDonated();
    router.push('/unterstuetzen');
  };

  return (
    <Dialog open={shouldShowReminder} onOpenChange={(open) => !open && snooze()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            Sporttag gefaellt dir?
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Sporttag ist ein kleines Open-Source-Projekt, das ich in meiner Freizeit entwickle.
            Wenn es dir bei der Organisation deines Sporttags hilft, wuerde ich mich ueber eine Pizza freuen!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleLearnMore} className="w-full bg-[#FFDD00] text-black hover:bg-[#FFDD00]/90">
            🍕 Mehr erfahren
          </Button>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={snooze} className="flex-1">
              Spaeter erinnern
            </Button>
            <Button variant="ghost" onClick={dismiss} className="flex-1 text-muted-foreground">
              Nicht mehr zeigen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
