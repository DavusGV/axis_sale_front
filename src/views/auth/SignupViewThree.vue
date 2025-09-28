<script setup lang="ts"></script>

<template>
  <div
    class="min-h-screen py-10 md:py-16 lg:py-20 xl:py-28 px-3 md:px-5 flex items-center justify-center bg-[url(/images/login-3.png)] bg-cover">
    <div class="box w-full p-3 md:p-4 xl:p-6 items-center max-w-[805px]">
      <form class="box bg-primary/5 dark:bg-bg3 lg:p-6 xl:p-8">
        <h3 class="h3 mb-4">Let&apos;s Get Started!</h3>
        <p class="md:mb-6 pb-4 mb-4 md:pb-6 bb-dashed text-sm md:text-base">
          Please Enter your Email Address to Start your Online Application
        </p>
        <div class="grid grid-cols-2 gap-x-4 xxxl:gap-x-6">
          <div class="col-span-2 md:col-span-1">
            <label for="name" class="md:text-lg font-medium block mb-3"> First Name </label>
            <input type="name"
              class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-3 py-2 md:px-6 md:py-3 mb-5"
              placeholder="Jone" id="name" required />
          </div>
          <div class="col-span-2 md:col-span-1">
            <label for="lname" class="md:text-lg font-medium block mb-3"> Last Name </label>
            <input type="lname"
              class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-3 py-2 md:px-6 md:py-3 mb-5"
              placeholder="Doe" id="lname" required />
          </div>
        </div>
        <label for="email" class="md:text-lg font-medium block mb-4">
          Enter Your Email ID
        </label>
        <input type="email"
          class="w-full text-sm focus:outline-none bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-3 py-2 md:px-6 md:py-3 mb-5"
          placeholder="Enter Your Email" id="email" required />
        <label for="referralcode" class="md:text-lg font-medium block mb-4">
          Someone invited you over?
        </label>
        <div
          class="bg-n0 dark:bg-bg4 border border-n30 dark:border-n500 rounded-3xl px-3 py-2 md:px-6 md:py-3 mb-7 relative">
          <input type="text" class="w-full text-sm bg-transparent focus:outline-none"
            placeholder="Enter the referral code" id="referralcode" required />
        </div>

        <p>
          By clicking submit, you agree to
          <RouterLink class="text-primary" to="#"> Terms of Use </RouterLink>
          ,
          <RouterLink class="text-primary" to="#"> Privacy Policy </RouterLink>
          ,
          <RouterLink class="text-primary" to="#"> E-sign </RouterLink>
          &
          <RouterLink class="text-primary" to="#"> Communication Authorization </RouterLink>
          .
        </p>
        <div class="mt-6 lg:mt-8">
          <button class="btn px-5">Sign Up</button>
        </div>
      </form>
    </div>
  </div>
</template>
