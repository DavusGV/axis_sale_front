<script setup lang="ts"></script>

<template>
  <div
    class="min-h-screen grid grid-cols-2 gap-5 relative lg:after:absolute lg:after:w-1/2 py-10 lg:py-20 after:h-full lg:after:bg-primary/5 lg:dark:after:bg-bg3 ltr:after:right-0 rtl:after:left-0 after:top-0">
    <div class="col-span-2 lg:col-span-1 flex items-center justify-center px-5 md:px-10 xxl:px-20 xxxl:px-28">
      <div class="box w-full p-3 md:p-4 xl:p-6 items-center">
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
            <RouterLink class="text-primary" to="#"> E-sign </RouterLink> &
            <RouterLink class="text-primary" to="#"> Communication Authorization </RouterLink>
            .
          </p>
          <div class="mt-6 lg:mt-8">
            <button class="btn px-5">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
    <div class="col-span-2 lg:col-span-1 flex items-center justify-center">
      <img src="/images/signup-1.png" class="relative z-[2] px-4" alt="img" :width="696" :height="547" />
    </div>
  </div>
</template>
