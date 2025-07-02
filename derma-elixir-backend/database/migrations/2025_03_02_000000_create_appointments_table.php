<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAppointmentsTable extends Migration
{
    public function up()
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('specialist_id');
            $table->unsignedBigInteger('treatment_id');
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->foreign('patient_id')->references('id')->on('users');
            $table->foreign('specialist_id')->references('id')->on('users');
            $table->foreign('treatment_id')->references('id')->on('treatments');
        });
    }

    public function down()
    {
        Schema::dropIfExists('appointments');
    }
}