<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable; // <--- C'est cette classe qui est attendue
use Illuminate\Queue\SerializesModels;

class RhCandidatMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $body;

    public function __construct($subject, $body)
    {
        $this->subject = $subject;
        $this->body = $body;
    }

    public function build()
    {
        return $this->subject($this->subject)
                    ->html($this->body); // Utilise ->html() puisque ton body contient du HTML
    }
}