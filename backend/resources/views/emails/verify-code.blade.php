<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 40px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #4F46E5; font-size: 28px; margin: 0; }
        .title { font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
        .subtitle { color: #6b7280; margin-bottom: 30px; }
        .code-box { background: #f3f4f6; border: 2px dashed #4F46E5; border-radius: 10px;
                    text-align: center; padding: 25px; margin: 25px 0; }
        .code { font-size: 42px; font-weight: bold; color: #4F46E5; letter-spacing: 10px; }
        .expiry { color: #ef4444; font-size: 14px; margin-top: 10px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b;
                   padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
        .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><h1>TalentFlow</h1></div>

        <p class="title">Bonjour {{ $user->name }} 👋</p>
        <p class="subtitle">
            Merci de vous être inscrit sur TalentFlow.<br>
            Voici votre code de vérification :
        </p>

        <div class="code-box">
            <div class="code">{{ $code }}</div>
            <div class="expiry">⏱ Ce code expire dans <strong>10 minutes</strong></div>
        </div>

        <div class="warning">
            ⚠️ Si vous n'avez pas créé de compte sur TalentFlow, ignorez cet email.
        </div>

        <div class="footer">
            © {{ date('Y') }} TalentFlow — Plateforme de recrutement
        </div>
    </div>
</body>
</html>