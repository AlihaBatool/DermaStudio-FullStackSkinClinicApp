<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class License extends Model
{
    protected $fillable = [
        'user_id', 
        'file_path', 
        'file_name', 
        'created_at'
    ];
    
    /**
     * Get the user that owns the license.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}