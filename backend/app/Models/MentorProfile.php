<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'session_duration_minutes',
    'session_price',
    'currency',
    'email',
    'is_accepting_students',
])]
class MentorProfile extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'session_duration_minutes' => 'integer',
            'session_price' => 'decimal:2',
            'is_accepting_students' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
