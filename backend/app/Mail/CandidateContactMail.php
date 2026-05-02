<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CandidateContactMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subjectLine;
    public $contentBody;
    public $application;

    /**
     * Create a new message instance.
     */
    public function __construct($subjectLine, $contentBody, $application = null)
    {
        $this->subjectLine = $subjectLine;
        $this->contentBody = $contentBody;
        $this->application = $application;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.candidate-contact', // On va créer cette vue juste après
        );
    }
}