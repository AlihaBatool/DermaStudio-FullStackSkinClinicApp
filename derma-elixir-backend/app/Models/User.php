<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'first_name', 
        'last_name', 
        'username', 
        'email', 
        'password', 
        'mobile', 
        'cnic', 
        'state', 
        'city', 
        'user_type',
        'has_certificate',
        'has_license',
        'specialty'
    ];

    protected $hidden = [
        'password',
    ];
    
    protected $casts = [
        'has_certificate' => 'boolean',
        'has_license' => 'boolean',
    ];
    
    /**
     * Get the certificates for the user.
     */
    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }
    
    /**
     * Get the licenses for the user.
     */
    public function licenses()
    {
        return $this->hasMany(License::class);
    }
}