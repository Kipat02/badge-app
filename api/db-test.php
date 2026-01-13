<?php
header('Content-Type: text/plain; charset=utf-8');

$url = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
if (!$url) {
  http_response_code(500);
  echo "ERRORE: DATABASE_URL non trovata su Vercel\n";
  exit;
}

try {
  $pdo = new PDO($url, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  ]);

  $res = $pdo->query("select now() as server_time")->fetch(PDO::FETCH_ASSOC);
  echo "DB OK ✅\n";
  echo "Server time: " . $res['server_time'] . "\n";
} catch (Throwable $e) {
  http_response_code(500);
  echo "DB KO ❌\n";
  echo $e->getMessage() . "\n";
}
