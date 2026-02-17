import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="relative py-12">
            <div className="mx-auto max-w-5xl text-center">
            <span className="text-9xl font-black text-primary/30 leading-none">404</span>
            </div>
        </div>
        <h1 className="text-3xl font-black text-foreground">ページが見つかりません</h1>
        <p className="text-muted-foreground">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="bg-primary text-primary-foreground">
              トップに戻る
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">ダッシュボード</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}