<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'appointment_id',
        'patient_id',
        'specialist_id',
        'treatment_id',
        'rating',
        'comment'
    ];

    // Add these relationship methods
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function specialist()
    {
        return $this->belongsTo(User::class, 'specialist_id');
    }

    public function treatment()
    {
        return $this->belongsTo(Treatment::class);
    }
}