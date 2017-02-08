@extends('index')

@section('inner')
<div class="container">

    <form method="POST" action="/auth/register">
        {!! csrf_field() !!}
        <div>
            Имя
            <input type="text" name="name" value="{{ old('name') }}">
        </div>
        <div>
            Email
            <input type="email" name="email" value="{{ old('email') }}">
        </div>
        <div>
            Пароль
            <input type="password" name="password">
        </div>
        <div>
            Подтверждение пароля
            <input type="password" name="password_confirmation">
        </div>
        <div>
            <button type="submit">Регистрация</button>
        </div>
    </form>

</div>
@stop
