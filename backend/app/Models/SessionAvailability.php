<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'scheduled_at',
    'ends_at',
    'status',
    'timezone',
])]

class SessionAvailability extends Model
{
    use HasFactory;
    
    protected $casts = [
        'scheduled_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(MentorSession::class);
    }
}
