import { Form, data, redirect, useNavigation } from "react-router";
import { validateEmail, validatePassword } from "./validation";
import type { Route } from "./+types/signup";
import Login from "./login";
import { request } from "http";
import { createClient } from "~/supabase.server";
import { commitSession, getSession, setSuccessMessage } from "~/session server";

export async function action({ request }: Route.ActionArgs) {
  let session = await getSession(request.headers.get("Cookie"));
  let formData = await request.formData();
  let email = String(formData.get("email"));
  let password = String(formData.get("password"));
  //validation
  let fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };
  // Return errors if any

  if (Object.values(fieldErrors).some(Boolean)) {
    return data(
      { fieldErrors },
      {
        status: 400,
        statusText: "Bad Request",
      }
    );
  }
  //sign up user
  let { supabase, headers } = createClient(request);
  let { data: userData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  let allHeaders = {
    ...Object.fromEntries(headers.entries()),
    "Set-Cookie": await commitSession(session),
  };
  throw redirect("/", {
    headers: allHeaders,
  });
}

export default function Signup({ actionData }: Route.ComponentProps) {
  let navigation = useNavigation();
  let isSubmitting = navigation.state === "submitting";
  return (
    <main className="grid gap-4 lg:grid-cols-2 h-screen  ">
      <div className="px-6 md:px-24 lg:px-0">
        <div className="lg:self-center h-screen bg-teal-800 bg-opacity-95 rounded-lg shadow-xl p-8 w-full mx-auto">
          <h1 className="font-thin text-6xl text-center text-white mt-6">
            Signup
          </h1>
          <Form method="post" className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-teal-100"
              >
                Email
                {actionData?.fieldErrors?.email && (
                  <span className="text-red-400">
                    {" "}
                    {actionData.fieldErrors.email}
                  </span>
                )}
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="off"
                className={`mt-1 block w-full px-4 py-2 rounded-md border border-teal-600 focus:ring-teal-400 focus:border-teal-500 text-gray-900 shadow-sm ${
                  actionData?.fieldErrors?.email ? "border-red-400" : ""
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-teal-100"
              >
                Password
                {actionData?.fieldErrors?.password && (
                  <span className="text-red-400">
                    {" "}
                    {actionData.fieldErrors.password}
                  </span>
                )}
              </label>
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="off"
                className={`mt-1 block w-full px-4 py-2 rounded-md border border-teal-600 focus:ring-teal-400 focus:border-teal-500 shadow-sm ${
                  actionData?.fieldErrors?.password ? "border-red-400" : ""
                }`}
              />
            </div>
            <div className="flex gap-6 items-center justify-center">
              <button
                type="submit"
                className="border border-teal-500 rounded-lg bg-gradient-to-r from-teal-700 to-teal-900 text-gray-100 text-2xl py-2 px-6 shadow-lg hover:bg-gradient-to-r hover:from-teal-800 hover:to-teal-900 hover:scale-105 transform transition-transform duration-300"
              >
                {/* Signup */}
                {isSubmitting ? "signing up..." : "signup"}
              </button>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  className="mr-2 accent-teal-500 w-5 h-5 cursor-pointer focus:ring focus:ring-teal-400"
                />
                <label
                  htmlFor="termsCheckbox"
                  className="text-lg text-gray-300 hover:text-teal-400 transition-colors duration-300"
                >
                  Remember me
                </label>
              </div>
            </div>
          </Form>
        </div>
      </div>

      <div>
        <img
          src="https://images.unsplash.com/photo-1614797163307-8b4315bc4b1d"
          alt=""
          className="w-full h-full object-cover rounded-lg shadow-xl"
        />
      </div>
    </main>
  );
}
