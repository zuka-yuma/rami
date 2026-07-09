import { useState } from 'react'
import { useForm , type SubmitHandler, type SubmitErrorHandler } from "react-hook-form"
import { useAuth } from '../contexts/AuthContext'
import { isAxiosError } from 'axios'

interface LoginInputs {
    email: string
    password: string
    name?: string
    passwordConfirm?: string
}


export default function LoginForm() {
    const [mode, setMode] = useState<"login" | "register">("login")
    const [serverError, setServerError] = useState<string>("")
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<LoginInputs>({ mode: "onBlur" })

    const { login: loginUser, register: registerUser } = useAuth()

    const isValid: SubmitHandler<LoginInputs> = async (data) => {
        setServerError("")
        try {
            if (mode === "login") {
                await loginUser(data.email, data.password)
            } else {
                await registerUser(data.email, data.name!, data.password)
            }
            setValue("password", "")
            setValue("passwordConfirm", "")
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                setServerError("メールアドレスまたはパスワードが正しくありません")
            } else if (isAxiosError(error) && error.response?.status === 409) {
                setServerError("このメールアドレスは既に登録されています")
            } else {
                setServerError("エラーが発生しました。もう一度お試しください")
            }
        }
    }
    const isInValid: SubmitErrorHandler<LoginInputs> = (errors) => {
        console.log(errors)
        if (mode === "login") {
            console.log("Fail Login")
        } else {
            console.log("Fail Register")
        }
    }

    const inputClass = "w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-100 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
                <h1 className="text-2xl font-semibold text-slate-100">rami</h1>
                <p className="mt-1 mb-5 text-sm text-slate-400">
                    {mode === "login" ? "ログイン" : "アカウント登録"}
                </p>

                {/* ログイン / 登録の切り替えタブ */}
                <div className="mb-5 flex rounded-lg bg-slate-900 p-1">
                    <button type="button" onClick={() => { setMode("login"); reset(); setServerError("") }}
                        className={`flex-1 rounded-md py-1.5 text-sm transition ${mode === "login" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                        ログイン
                    </button>
                    <button type="button" onClick={() => { setMode("register"); reset(); setServerError("") }}
                        className={`flex-1 rounded-md py-1.5 text-sm transition ${mode === "register" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                        登録
                    </button>
                </div>

                {serverError && <p className="mb-3 text-sm text-red-400">{serverError}</p>}

                <form onSubmit={handleSubmit(isValid, isInValid)} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-300" htmlFor="email">Email</label>
                        <input id="email" type="email" className={inputClass}
                            {...register("email", { required: "emailを入力してください" })} />
                        {errors.email?.message && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
                    </div>

                    {mode === "register" && (
                        <div>
                            <label className="mb-1 block text-sm text-slate-300" htmlFor="name">Name</label>
                            <input id="name" className={inputClass}
                                {...register("name", { required: "nameを入力してください" })} />
                            {errors.name?.message && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm text-slate-300" htmlFor="password">Password</label>
                        <input id="password" type="password" className={inputClass}
                            {...register("password", {
                                required: "passwordを入力してください",
                                minLength: { value: 8, message: "8文字以上入力してください" },
                            })} />
                        {errors.password?.message && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
                    </div>

                    {mode === "register" && (
                        <div>
                            <label className="mb-1 block text-sm text-slate-300" htmlFor="passwordConfirm">Confirm Password</label>
                            <input id="passwordConfirm" type="password" className={inputClass}
                                {...register("passwordConfirm", {
                                    required: "確認用パスワード入力してください",
                                    validate: (value, formValues) =>
                                        value === formValues.password || "パスワードが一致しません",
                                })} />
                            {errors.passwordConfirm?.message && <p className="mt-1 text-sm text-red-400">{errors.passwordConfirm.message}</p>}
                        </div>
                    )}

                    <button type="submit"
                        className="mt-1 w-full rounded-md bg-teal-600 py-2 font-medium text-white transition hover:bg-teal-500">
                        {mode === "login" ? "ログイン" : "登録"}
                    </button>
                </form>
            </div>
        </div>
    )
}
