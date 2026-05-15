<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'description',
    'type',
    'duration_minutes',
    'max_capacity',
    'price',
    'currency',
    'is_active'
])]

class MentorSession extends Model
{
    use HasFactory;
    
    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function mentor()
    {
        return $this->belongsTo(User::class);
    }
}
