<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PatientHistory extends Model
{
    protected $fillable = [
        'patient_id',
        'specialist_id',
        'diagnosis',
        'medications',
        'notes',
        'appointment_id'
    ];

    public function patient() {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function specialist() {
        return $this->belongsTo(User::class, 'specialist_id');
    }

    public function appointment() {
        return $this->belongsTo(Appointment::class);
    }
}