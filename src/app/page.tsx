import { redirect } from 'next/navigation';

// ルートは選考一覧（メイン画面）へ。未ログインなら middleware が /login へ回す。
export default function Home() {
  redirect('/placements');
}
